const datain = require('./datain')

const keyboardMain = [
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
function getKeyboardDays() {
	let date = []
	for (let i = 0; i < 10; i = i + 2) {
		date.push([{ text: datain.creatDayArr()[i], callback_data: datain.creatDayArr()[i] }, { text: datain.creatDayArr()[i + 1], callback_data: datain.creatDayArr()[i + 1] }])
	}
	return date
};
const keyboardMeetingTimes = [];
for (let i = 0; i < datain.timesArr.length; i = i + 6) {
	keyboardMeetingTimes.push([{ text: datain.timesArr[i], callback_data: datain.timesArr[i] }, { text: datain.timesArr[i + 1], callback_data: datain.timesArr[i + 1] }, { text: datain.timesArr[i + 2], callback_data: datain.timesArr[i + 2] }, { text: datain.timesArr[i + 3], callback_data: datain.timesArr[i + 3] }, { text: datain.timesArr[i + 4], callback_data: datain.timesArr[i + 4] }, { text: datain.timesArr[i + 5], callback_data: datain.timesArr[i + 5] }]);
};
const keyboardLocations = [];
for (let i = 0; i < datain.locations.length; i = i + 2) {
	keyboardLocations.push([{ text: datain.locations[i], callback_data: datain.locations[i] }, { text: datain.locations[i + 1], callback_data: datain.locations[i + 1] }]);
};
const keyboardDistances = [];
for (let i = 0; i < 12; i = i + 4) {
	keyboardDistances.push([{ text: datain.distanceArr[i], callback_data: datain.distanceArr[i] }, { text: datain.distanceArr[i + 1], callback_data: datain.distanceArr[i + 1] }, { text: datain.distanceArr[i + 2], callback_data: datain.distanceArr[i + 2] }, { text: datain.distanceArr[i + 3], callback_data: datain.distanceArr[i + 3] }]);
};
const keyboardSpeed = [
	[{ text: datain.speedArr[0], callback_data: datain.speedArr[0] }, { text: datain.speedArr[1], callback_data: datain.speedArr[1] }, { text: datain.speedArr[2], callback_data: datain.speedArr[2] }],
	[{ text: datain.speedArr[3], callback_data: datain.speedArr[3] }, { text: datain.speedArr[4], callback_data: datain.speedArr[4] }, { text: datain.speedArr[5], callback_data: datain.speedArr[5] }]
];
const keyboardDifficulty = [
	[{ text: datain.levelArr[0], callback_data: datain.levelArr[0] }, { text: datain.levelArr[1], callback_data: datain.levelArr[1] }, { text: datain.levelArr[2], callback_data: datain.levelArr[2] }],
	[{ text: datain.levelArr[3], callback_data: datain.levelArr[3] }, { text: datain.levelArr[4], callback_data: datain.levelArr[4] }, { text: datain.levelArr[5], callback_data: datain.levelArr[5] }]
];
// сводные данных по заезду
const keyboardSummary = [[{ text: 'Опубликовать', callback_data: 'meetSend' }, { text: 'Редактировать', callback_data: 'meetEdit' }]];
// для проверки заполнения ячеек
const keyboardBack = [[{ text: 'Продолжить ввод данных', callback_data: 'meetEdit' }]];
// формируем инлайн клавиатуру из отфильтрованных элементов, вырезая необходимую информацию и значения message.text
function getKeyboardForDelPost(messageFromDb) {
	let keyboardForDelPost = [];
	for (let i = 0; i < messageFromDb.length; i++) {
		keyboardForDelPost.push([{ text: messageFromDb[i].messageChannel.text.substring(33, 79).replace(/\n/g, '.'), callback_data: `ffmi${messageFromDb[i].messageChannel.message_id}` }])
	}
	return keyboardForDelPost
}




module.exports.keyboardMain = keyboardMain;
module.exports.getKeyboardDays = getKeyboardDays;
module.exports.keyboardLocations = keyboardLocations;
module.exports.keyboardMeetingTimes = keyboardMeetingTimes;
module.exports.keyboardDistances = keyboardDistances;
module.exports.keyboardSpeed = keyboardSpeed;
module.exports.keyboardDifficulty = keyboardDifficulty;
module.exports.keyboardSummary = keyboardSummary;
module.exports.keyboardBack = keyboardBack;
module.exports.getKeyboardForDelPost = getKeyboardForDelPost;