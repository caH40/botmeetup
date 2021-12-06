// удаление устаревших объявлений из канала "объявления о велозаездах" и из файла истории объявлений history_channel.json 
require('dotenv').config();
const datain = require('./datain');// модуль данных

module.exports = function posters(fs, bot) {
	let arr = [];
	fs.readFile(`./app_modules/history_channel.json`, 'utf-8', (err, content) => {
		if (err) {
			throw err
		}
		let contentArr = JSON.parse(content);
		for (let i = 0; i < contentArr.length; i++) {
			let datePosition = JSON.stringify(contentArr[i]['text']).search(/\d{1,2}\.\d{1,2}\.\d{4}/);// преобразуем в строку и ищем позицию даты "дд.мм.гггг" в строке
			let dateMesHis = contentArr[i]['text'].substr(datePosition - 2, 10);// substr возвращает из строки 10 символов (дата) с найденной ранее позиции (почему -2 !! надо разобраться)
			let dateMesHisArr = dateMesHis.split('.');// разбиваем дату на массив из трех элементов: день, месяц, год
			let dateMesHisChange = new Date(`${dateMesHisArr[2]}-${dateMesHisArr[1]}-${dateMesHisArr[0]}`).getTime(); // делаем дату в нужном формате
			const dayKeepHistory = 3; //если запись старше 4х дней, но она не записывается в новый массив arr
			// console.log(datain.dateSecToday() - (dayKeepHistory * datain.daySec < dateMesHisChange))
			if ((datain.dateSecToday() - (dayKeepHistory * datain.daySec)) < dateMesHisChange) {
				arr.push(contentArr[i]);
			}
			else {
				bot.telegram.deleteMessage(process.env.CHANNEL_TELEGRAM, contentArr[i].forward_from_message_id);
			};
		};
		//записываем обоатно в файл новый массив с актуальными объявлениями
		fs.writeFile(`./app_modules/history_channel.json`, JSON.stringify(arr), err => {
			if (err) {
				throw err
			}
		});
	});
}
