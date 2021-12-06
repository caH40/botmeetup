const weatherWeek = require('./weatherweek.json');

function getWeatherStart(date, location) {
	let current = weatherWeek.find((elm) => elm.date === date && elm.city === location)
	current ??= []
	current.desc ??= 'Предсказываю погоду на более близкие даты...'
	current.desc = current.desc.charAt(0).toUpperCase() + current.desc.slice(1)
	return `<b>Температура утром</b>: ${current.tempMorn ?? '---'}°C\n<b>Температура днём</b>: ${current.tempDay ?? '---'}°C\n<b>Температура вечером</b>: ${current.tempEve ?? '---'}°C\n<b>Влажность</b>: ${current.humidity ?? '---'}%\n<b>Скорость ветра</b>: ${current.windSpeed ?? '---'}м/с\n<b>${current.desc ?? '---'}</b>`
}
module.exports = getWeatherStart