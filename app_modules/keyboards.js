const datain = require('./datain')

const start = [
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
function creatDayKey() {
	let date = []
	for (let i = 0; i < 10; i = i + 2) {
		date.push([{ text: datain.creatDayArr()[i], callback_data: datain.creatDayArr()[i] }, { text: datain.creatDayArr()[i + 1], callback_data: datain.creatDayArr()[i + 1] }])
	}
	return date
};
const times = [];
for (let i = 0; i < datain.timesArr.length; i = i + 6) {
	times.push([{ text: datain.timesArr[i], callback_data: datain.timesArr[i] }, { text: datain.timesArr[i + 1], callback_data: datain.timesArr[i + 1] }, { text: datain.timesArr[i + 2], callback_data: datain.timesArr[i + 2] }, { text: datain.timesArr[i + 3], callback_data: datain.timesArr[i + 3] }, { text: datain.timesArr[i + 4], callback_data: datain.timesArr[i + 4] }, { text: datain.timesArr[i + 5], callback_data: datain.timesArr[i + 5] }]);
};
const location = [];
for (let i = 0; i < datain.locations.length; i = i + 2) {
	location.push([{ text: datain.locations[i], callback_data: datain.locations[i] }, { text: datain.locations[i + 1], callback_data: datain.locations[i + 1] }]);
};
const distance = [];
for (let i = 0; i < 12; i = i + 4) {
	distance.push([{ text: datain.distanceArr[i], callback_data: datain.distanceArr[i] }, { text: datain.distanceArr[i + 1], callback_data: datain.distanceArr[i + 1] }, { text: datain.distanceArr[i + 2], callback_data: datain.distanceArr[i + 2] }, { text: datain.distanceArr[i + 3], callback_data: datain.distanceArr[i + 3] }]);
};
const speed = [
	[{ text: datain.speedArr[0], callback_data: datain.speedArr[0] }, { text: datain.speedArr[1], callback_data: datain.speedArr[1] }, { text: datain.speedArr[2], callback_data: datain.speedArr[2] }],
	[{ text: datain.speedArr[3], callback_data: datain.speedArr[3] }, { text: datain.speedArr[4], callback_data: datain.speedArr[4] }, { text: datain.speedArr[5], callback_data: datain.speedArr[5] }]
];
const level = [
	[{ text: datain.levelArr[0], callback_data: datain.levelArr[0] }, { text: datain.levelArr[1], callback_data: datain.levelArr[1] }, { text: datain.levelArr[2], callback_data: datain.levelArr[2] }],
	[{ text: datain.levelArr[3], callback_data: datain.levelArr[3] }, { text: datain.levelArr[4], callback_data: datain.levelArr[4] }, { text: datain.levelArr[5], callback_data: datain.levelArr[5] }]
];
// сводные данных по заезду
const summary = [[{ text: 'Опубликовать', callback_data: 'meetSend' }, { text: 'Редактировать', callback_data: 'meetEdit' }]];
// для проверки заполнения ячеек
const filled = [[{ text: 'Продолжить ввод данных', callback_data: 'meetEdit' }]];
// формируем инлайн клавиатуру из отфильтрованных элементов, вырезая необходимую информацию и значения message.text
function keymyPost(messageFromBd) {
	let keymyPosts = [];
	for (let i = 0; i < messageFromBd.length; i++) {
		keymyPosts.push([{ text: messageFromBd[i].messageChannel.text.substring(33, 79).replace(/\n/g, '.'), callback_data: `ffmi${messageFromBd[i].messageChannel.message_id}` }])
	}
	return keymyPosts
}




module.exports.start = start;
module.exports.creatDayKey = creatDayKey;
module.exports.location = location;
module.exports.times = times;
module.exports.distance = distance;
module.exports.speed = speed;
module.exports.level = level;
module.exports.summary = summary;
module.exports.filled = filled;
module.exports.keymyPost = keymyPost;