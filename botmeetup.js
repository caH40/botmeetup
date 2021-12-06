require('dotenv').config();
const { Telegraf, session } = require('telegraf');
const mongoose = require('mongoose');

const keys = require('./app_modules/keyboards');// модуль клавиатур
const text = require('./app_modules/commands');// модуль текстовых сообщений
const datain = require('./app_modules/datain');// модуль данных
const creatLogErr = require('./app_modules/logerror');// модуль данных
const ratingBd = require('./app_modules/ratingBd');
const getWeatherStart = require('./weather/getweatherstart');
const getWeather = require('./weather/getweather');
const logsMessagesChannel = require('./app_modules/logsMessagesChannel');
const Message = require('./models/Message')
const Rating = require('./models/Rating');
const { stopCoverage } = require('v8');

const bot = new Telegraf(process.env.BOT_TOKEN);

// подключение к базе данных
mongoose.connect(process.env.MONGODB)
	.then(() => {
		console.log('MongoDb connected..')
	})
	.catch((e) => {
		console.log(e)
	})

bot.use(session())
let members // переменная для сохранения данных сессии
bot.catch((err, ctx) => {
	console.log(`Ooops, encountered an error for ${ctx.updateType}`, err)
})
// контроль голосования option_ids: [ 0 ] первый ответ
// не могу найти привязки между сообщениями в канале и голосованием в группе, поможет при формировании этих сообщений записывать дополнительный идентификатор к этим событиям
// bot.on('poll_answer', async ctx => {
// 	console.log(ctx)
// 	if (ctx.update.poll_answer.option_ids[0] === 0) {
// 		const forwardedMessageId = 87
// 		const pollObj = await Message.find()
// 		// console.log(pollObj[0].message.text)
// 		ctx.telegram.editMessageText(process.env.CHANNEL_TELEGRAM, forwardedMessageId, 'привет!', pollObj[0].message.text + `\n` + 'Участвуют: ' + pollObj[0].pollCount)
// 	}
// })

// кнопка start
bot.start(async (ctx) => {
	const userName = ctx.update.message.from.username;
	await ctx.reply(`Привет ${userName ? userName : 'незнакомец'} ! ${text.textStart}`, { parse_mode: 'html', disable_web_page_preview: true })
});
bot.help(async (ctx) => {
	await ctx.reply(text.commands, { parse_mode: 'html', disable_web_page_preview: true })
});
// RideOn
// для последовательного выполнения команд надо функцию делать асинхронной с помощью async/await
bot.command('rideon', async ctx => {
	try {
		if (ctx.update.message.from.username) {
			// обнуление сессии
			members = {}
			ctx.session = {}
			ctx.session.start = [
				[
					{ text: 'Дата заезда', callback_data: 'meetDate' },
					{ text: 'Время старта заезда', callback_data: 'meetTime' }
				],
				[
					{ text: 'Место сбора', callback_data: 'meetLocation' },
					{ text: 'Дистанция, км', callback_data: 'meetDistance' }
				],
				[
					{ text: 'Средняя скорость', callback_data: 'meetSpeed' },
					{ text: 'Сложность заезда', callback_data: 'meetLevel' }
				],
				[
					{ text: 'Сводные данные по заезду', callback_data: 'meetSummary' }
				]
			]
			await ctx.deleteMessage(ctx.update.message.message_id).catch(e => creatLogErr(e));
			await ctx.reply('Выберите блок заполнения', { reply_markup: { inline_keyboard: ctx.session.start } }).catch(e => creatLogErr(e));
		}
		else {
			await ctx.reply('Пользователи с приватным аккаунтом не могут создавать объявления')
		}
	} catch (err) {
		console.error(err);
	};
});
bot.command('rating', async ctx => {
	let ratingTextI = `Самые активные организаторы заездов:\n`
	const contextParse = await Rating.find().sort({ posts: -1 })
	for (let i = 0; i < contextParse.length; i++) {
		let ratingText = `${i + 1}. ${contextParse[i].username}-${contextParse[i].posts} 🚴 \n`
		ratingTextI = ratingTextI + ratingText
	}
	await ctx.reply(ratingTextI).catch((e) => console.log(e))

});
// создание инлайнклавиатуры keymyPosts массива со всеми созданными автором объявления
// также создается массив из объектов объявлений автора keymyPosts
bot.command('delete', async ctx => {
	const regexp = RegExp('@' + ctx.update.message.from.username)
	const messageFromBd = await Message.find({ "message.text": regexp })
	// формируем инлайн клавиатуру из отфильтрованных элементов, вырезая необходимую информацию и значения message.text
	let keymyPosts = [];
	for (let i = 0; i < messageFromBd.length; i++) {
		keymyPosts.push([{ text: messageFromBd[i].message.text.substring(33, 79).replace(/\n/g, '.'), callback_data: `ffmi${messageFromBd[i].message.forward_from_message_id}` }])
	};
	// проверяем есть ли записи в массиве myPost или нет
	if ((typeof messageFromBd[0]) !== 'undefined') {
		await ctx.reply('Какое объявление удаляем?', { reply_markup: { inline_keyboard: keymyPosts } }).catch((e) => console.log(e))
	}
	else {
		await ctx.reply('Ваших объявлений нет!').catch((e) => console.log(e))
	}
});
//===================================================================================================
// сохранение всех сообщений на каннале в mongodb
bot.on('message', async (ctx) => {
	if (typeof ctx.update.message.forward_from_message_id !== 'undefined') {
		logsMessagesChannel(ctx.message)
	}

	if (ctx.update.message.from.id === 777000) {
		// отправляем голосование в группу дискуссий "прикрепляя" его к переадресованному сообщению reply_to_message_id
		await ctx.telegram.sendPoll(process.env.GROUP_TELEGRAM, 'Кто участвует в заезде?', ['Участвую!', 'Не участвую!', 'Ищу возможность!'], { 'is_anonymous': false, 'correct_option_id': 0, 'reply_to_message_id': ctx.update.message.message_id }).catch((e) => console.log(e))
		// добавление сообщения о погоде в дискуссию о заезде
		await ctx.telegram.sendMessage(process.env.GROUP_TELEGRAM, getWeatherStart(members.dateM, members.locationsM) ?? 'нет данных', { 'is_anonymous': false, 'correct_option_id': 0, 'reply_to_message_id': ctx.update.message.message_id, parse_mode: 'html' }).catch((e) => console.log(e))
	}
})
//===================================================================================================
// обработка всех нажатий инлайн кнопок
bot.on('callback_query', async (ctx) => {
	const userName = ctx.update.callback_query.from.username;
	ctx.session.start ??= [
		[
			{ text: 'Дата заезда', callback_data: 'meetDate' },
			{ text: 'Время старта заезда', callback_data: 'meetTime' }
		],
		[
			{ text: 'Место сбора', callback_data: 'meetLocation' },
			{ text: 'Дистанция, км', callback_data: 'meetDistance' }
		],
		[
			{ text: 'Средняя скорость', callback_data: 'meetSpeed' },
			{ text: 'Сложность заезда', callback_data: 'meetLevel' }
		],
		[
			{ text: 'Сводные данные по заезду', callback_data: 'meetSummary' }
		]
	];
	ctx.session.creatM = '@' + userName;
	//итоговое объявление о заезде
	const meetStr = `<b>Данные о планируемом велозаезде</b>:\n<b>Дата</b>: ${ctx.session.dateM ?? '---'}\n<b>Время</b>: ${ctx.session.timeM ?? '---'}\n<b>Место</b>: ${ctx.session.locationsM ?? '---'}\n<b>Дистанция</b>: ${ctx.session.distanceM ?? '---'} \n<b>Tемп</b>: ${ctx.session.speedM ?? '---'}\n<b>Сложность</b>: ${ctx.session.levelM ?? '---'}\n<b>Организатор заезда</b>: ${ctx.session.creatM}`;

	const cbData = ctx.update.callback_query.data; // callback_data
	await ctx.deleteMessage(ctx.update.callback_query.message.message_id).catch(e => creatLogErr(e)); // удаление меню инлайн клавиатуры после нажатия любой кнопки
	// ctx.answerCbQuery(); // убираем иконку часов с инлайн кнопки, если вставить текст, по выводит в центре эрана телеграм
	function handleQuery(callbackData, textTitle, keyboard) {
		if (cbData === callbackData) {
			ctx.reply(textTitle, { reply_markup: { inline_keyboard: keyboard } });
		};
	}
	// вывод меню с датами выбираем 
	handleQuery('meetDate', 'Дата запланированного заезда', keys.creatDayKey());
	// вывод меню время
	handleQuery('meetTime', 'Время старта', keys.times);
	// вывод меню места
	handleQuery('meetLocation', 'Место сбора(старта) заезда', keys.location);
	// вывод меню дистанций
	handleQuery('meetDistance', 'Дистанция заезда, км', keys.distance);
	// вывод меню скорости
	handleQuery('meetSpeed', 'Средняя скорость заезда, км/ч', keys.speed);
	// вывод меню сложности
	handleQuery('meetLevel', 'Уровень сложности заезда', keys.level);
	// вывод меню сводных данных по заезду, публикация или редактирование
	if (cbData === 'meetSummary') {
		await ctx.replyWithHTML(meetStr, { reply_markup: { inline_keyboard: keys.summary } }).catch((e) => console.log(e))
	};
	//===================================================================================================
	// отправка итогового объявления на канал объявлений
	if (cbData === 'meetSend') {
		// проверка заполнения всех полей
		if (meetStr.includes('---')) {
			await ctx.reply('Не все поля заполнены!!!', { reply_markup: { inline_keyboard: keys.filled } }).catch((e) => console.log(e));
		} else {
			members = ctx.session
			await ctx.telegram.sendMessage(process.env.CHANNEL_TELEGRAM, meetStr, { parse_mode: 'html', disable_web_page_preview: true }).catch((e) => console.log(e));
			// подсчет количества созданных объявлений
			ratingBd(userName);
			// сообщение о размещении объявления на канале
			await ctx.reply(text.textPost).catch((e) => console.log(e));
			//обнуление данных сессии
			// ctx.session = {};
		}
	};
	// редактирование создаваемого объявления
	if (cbData === 'meetEdit') {
		output()
	};
	//===================================================================================================
	async function output() {
		await ctx.reply('Выберите блок заполнения', { reply_markup: { inline_keyboard: ctx.session.start } }).catch((e) => console.log(e))
	}
	// обработка данных всех подменю
	if (datain.creatDayArr().includes(cbData)) {
		try {
			ctx.session.dateM = cbData;
			ctx.session.start[0][0].text = 'Дата заезда ✔️';
		} catch (err) {
			console.error(err);
		};
		output();
	};
	if (datain.timesArr.includes(cbData)) {
		ctx.session.timeM = cbData;
		ctx.session.start[0][1].text = 'Время старта заезда ✔️';
		output();
	};
	if (datain.locations.includes(cbData)) {
		ctx.session.locationsM = cbData;
		ctx.session.start[1][0].text = 'Место сбора ✔️';
		output();
	};
	if (datain.distanceArr.includes(cbData)) {
		ctx.session.distanceM = cbData;
		ctx.session.start[1][1].text = 'Дистанция, км ✔️';;
		output();
	};
	if (datain.speedArr.includes(cbData)) {
		ctx.session.speedM = cbData;
		ctx.session.start[2][0].text = 'Средняя скорость ✔️';
		output();
	};
	if (datain.levelArr.includes(cbData)) {
		ctx.session.levelM = cbData;
		ctx.session.start[2][1].text = 'Сложность заезда ✔️';
		output();
	};
	// блок удаления автором ненужных объявлений с канала объявлений
	if (cbData.includes('ffmi')) {
		const forwardMess = cbData.replace(/ffmi/g, ''); //чистим callback_data от служебных символов ffmi
		await ctx.telegram.editMessageText(process.env.CHANNEL_TELEGRAM, forwardMess, 'привет!', 'Объявление не актуально! Удалено автором поста.').catch((e) => creatLogErr(e))
		//база данных ждет forwardMess в формате Number
		await Message.deleteOne({ "message.forward_from_message_id": +forwardMess }).catch((e) => console.log(e))
		await ctx.reply('Ваше объявление удалено!').catch((e) => console.log(e));
	};
});

bot.launch();
//получение данных о погоде
setInterval(() => {
	getWeather()
}, 86400000);


// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));