require('dotenv').config();
const { Telegraf, session } = require('telegraf');
const mongoose = require('mongoose');

const keys = require('./app_modules/keyboards');// модуль клавиатур
const {
	getKeyboardForDelPost,
	getKeyboardDays,
	keyboardBack,
	keyboardMain,
	keyboardLocations,
	keyboardSummary,
	keyboardMeetingTimes,
	keyboardDistances,
	keyboardSpeed,
	keyboardDifficulty
} = require('./app_modules/keyboards');// модуль клавиатур
const text = require('./app_modules/commands');// модуль текстовых сообщений
const datain = require('./app_modules/datain');// модуль данных
const creatLogErr = require('./app_modules/logerror');// модуль данных
const pollCountUpdate = require('./app_modules/pollcount');// модуль данных
const getWeatherStart = require('./weather/getweatherstart');
const getWeatherDb = require('./weather/getweatherDb');
const weatherUpdate = require('./weather/weatherupdate');
const Message = require('./models/Message');
const { creatRating, createListRating } = require('./app_modules/ratingDb');
const { logsMessagesChannel, updateMessage } = require('./app_modules/logsMessagesChannel');



const bot = new Telegraf(process.env.BOT_TOKEN);
// подключение к базе данных
mongoose.connect(process.env.MONGODB)
	.then(() => {
		console.log('MongoDb connected..')
	})
	.catch((error) => {
		console.log(error)
	})

bot.use(session())
let members // переменная для сохранения данных сессии

bot.catch((error, ctx) => {
	console.log(`Ooops, encountered an error for ${ctx.updateType}`, error)
})

bot.on('poll_answer', async ctx => {
	// обновление данных об количестве участников в БД, channel, group
	await pollCountUpdate(ctx).catch((error) => console.log(error))
})

bot.start(async (ctx) => {
	const userName = ctx.update.message.from.username;
	await ctx.reply(`Привет ${userName ? userName : 'незнакомец'} ! ${text.textStart}`, { parse_mode: 'html', disable_web_page_preview: true })
		.catch((error) => console.log(error))
});

bot.help(async (ctx) => {
	await ctx.reply(text.commands, { parse_mode: 'html', disable_web_page_preview: true })
		.catch((error) => console.log(error))
});

bot.command('rideon', async ctx => {
	try {
		if (ctx.update.message.from.username) {
			// обнуление сессии
			members = {}
			ctx.session = {}
			//при замене значения из модуля на keyboardMain, смешиваются ответы из разных сессий!!
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
			];
			await ctx.deleteMessage(ctx.update.message.message_id).catch((error) => creatLogErr(error));
			await ctx.reply('Выберите блок заполнения', { reply_markup: { inline_keyboard: ctx.session.start } }).catch((error) => creatLogErr(error));
		}
		else {
			await ctx.reply('Пользователи с приватным аккаунтом не могут создавать объявления')
		}
	} catch (error) {
		console.error(error);
	};
});
// Запрос рейтинга вело организаторов
bot.command('rating', async ctx => {
	await ctx.reply(await createListRating()).catch((e) => console.log(e))
});
// создание инлайнклавиатуры getKeyboardForDelPost массива со всеми созданными автором объявления
bot.command('delete', async ctx => {
	try {
		const regexp = RegExp('@' + ctx.update.message.from.username)
		const messageFromBd = await Message.find({ "message.text": regexp })
		// проверяем есть ли записи в массиве getKeyboardForDelPost или нет
		if (messageFromBd[0]) {
			await ctx.reply('Какое объявление удаляем?', { reply_markup: { inline_keyboard: getKeyboardForDelPost(messageFromBd) } })
		}
		else {
			await ctx.reply('Ваших объявлений нет!')
		}
	} catch (error) {
		console.log(error)
	}
});
// сохранение всех сообщений на канале в mongodb
bot.on('message', async (ctx) => {
	try {
		const idMainTelegram = 777000
		if (ctx.update.message.from.id === idMainTelegram) {
			// отправляем голосование в группу дискуссий "прикрепляя" его к переадресованному сообщению reply_to_message_id
			const pollAnswers = ['Участвую!', 'Не участвую!', 'Ищу возможность!']
			const optionalOptions = { 'is_anonymous': false, 'correct_option_id': 0, 'reply_to_message_id': ctx.update.message.message_id, parse_mode: 'html' }
			// добавление голосования кто участвует в заезде в дискуссию о заезде
			const messageIdPoll = await ctx.telegram.sendPoll(process.env.GROUP_TELEGRAM, 'Кто участвует в заезде?', pollAnswers, optionalOptions)
			// добавление сообщения о погоде в дискуссию о заезде
			const messageIdWeather = await ctx.telegram.sendMessage(process.env.GROUP_TELEGRAM, await getWeatherStart(members.dateM, members.locationsM) ?? 'нет данных', optionalOptions)
			await updateMessage(messageIdPoll.reply_to_message.forward_from_message_id, messageIdPoll, messageIdWeather)
		}
	} catch (error) {
		console.log(error)
	}

	const millisecondsInHalfHour = 1800000
	setInterval(() => {
		weatherUpdate(ctx)
	}, millisecondsInHalfHour)

})
//===================================================================================================
// обработка всех нажатий инлайн кнопок
bot.on('callback_query', async (ctx) => {
	const userName = ctx.update.callback_query.from.username;
	ctx.session.start ??= keyboardMain
	ctx.session.creatM = '@' + userName;
	//итоговое объявление о заезде
	const meetStr = `<b>Данные о планируемом велозаезде</b>:\n<b>Дата</b>: ${ctx.session.dateM ?? '---'}\n<b>Время</b>: ${ctx.session.timeM ?? '---'}\n<b>Место</b>: ${ctx.session.locationsM ?? '---'}\n<b>Дистанция</b>: ${ctx.session.distanceM ?? '---'} \n<b>Tемп</b>: ${ctx.session.speedM ?? '---'}\n<b>Сложность</b>: ${ctx.session.levelM ?? '---'}\n<b>Организатор заезда</b>: ${ctx.session.creatM}`;

	const cbData = ctx.update.callback_query.data; // callback_data
	await ctx.deleteMessage(ctx.update.callback_query.message.message_id).catch((error) => creatLogErr(error)); // удаление меню инлайн клавиатуры после нажатия любой кнопки

	function handleQuery(callbackData, textTitle, keyboard) {
		if (cbData === callbackData) {
			ctx.reply(textTitle, { reply_markup: { inline_keyboard: keyboard } })
		}
	}

	// вывод меню с датами выбираем 
	handleQuery('meetDate', 'Дата запланированного заезда', getKeyboardDays());
	// вывод меню время
	handleQuery('meetTime', 'Время старта', keyboardMeetingTimes);
	// вывод меню места
	handleQuery('meetLocation', 'Место сбора(старта) заезда', keyboardLocations);
	// вывод меню дистанций
	handleQuery('meetDistance', 'Дистанция заезда, км', keyboardDistances);
	// вывод меню скорости
	handleQuery('meetSpeed', 'Средняя скорость заезда, км/ч', keyboardSpeed);
	// вывод меню сложности
	handleQuery('meetLevel', 'Уровень сложности заезда', keyboardDifficulty);
	// вывод меню сводных данных по заезду, публикация или редактирование

	if (cbData === 'meetSummary') {
		await ctx.replyWithHTML(meetStr, { reply_markup: { inline_keyboard: keyboardSummary } }).catch((error) => console.log(error))
	};
	//===================================================================================================
	// отправка итогового объявления на канал объявлений
	if (cbData === 'meetSend') {
		// проверка заполнения всех полей
		try {
			if (meetStr.includes('---')) {
				await ctx.reply('Не все поля заполнены!!!', { reply_markup: { inline_keyboard: keyboardBack } })
			} else {
				members = ctx.session // используется для добавления данных о погоде
				const messageChannel = await ctx.telegram.sendMessage(process.env.CHANNEL_TELEGRAM, meetStr, { parse_mode: 'html', disable_web_page_preview: true })
				// подсчет количества созданных объявлений
				await creatRating(userName)
				// сообщение о размещении объявления на канале
				await ctx.reply(text.textPost)
				//запись в базу данных
				await logsMessagesChannel(messageChannel)
			}
		} catch (error) {
			console.log(error)
		}

	};
	async function output() {
		await ctx.reply('Выберите блок заполнения', { reply_markup: { inline_keyboard: ctx.session.start } }).catch((e) => console.log(e))
	}
	// редактирование создаваемого объявления
	if (cbData === 'meetEdit') {
		output()
	};
	// обработка данных всех подменю
	if (datain.creatDayArr().includes(cbData)) {
		ctx.session.dateM = cbData;
		ctx.session.start[0][0].text = 'Дата заезда ✔️';
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
		try {
			const forwardMess = cbData.replace(/ffmi/g, ''); //чистим callback_data от служебных символов ffmi
			await ctx.telegram.editMessageText(process.env.CHANNEL_TELEGRAM, forwardMess, 'привет!', 'Объявление не актуально! Удалено автором поста.')
			//база данных ждет forwardMess в формате Number
			await Message.deleteOne({ "message.forward_from_message_id": +forwardMess })
			await ctx.reply('Ваше объявление удалено!')
		} catch (error) {
			console.log(error)
		}
	};
});

bot.launch();
//получение данных о погоде
const millisecondsInHour = 3600000
setInterval(() => {
	getWeatherDb()
}, millisecondsInHour);


// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));