module.exports = function postersWrong(fs, forwardMess) {
	let arr = [];
	fs.readFile(`./app_modules/history_channel.json`, 'utf-8', (err, content) => {
		if (err) {
			throw err
		}
		let contentArr = JSON.parse(content);
		arr = contentArr.filter(element => element.forward_from_message_id != forwardMess)
		// записываем обратно в файл новый массив с актуальными объявлениями
		fs.writeFile(`./app_modules/history_channel.json`, JSON.stringify(arr), err => {
			if (err) {
				throw err
			}
		});
	});
}
