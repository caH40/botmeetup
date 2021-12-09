const WeatherWeek = require('../models/WeatherWeek')

//!! делается запрос погоды из базы при каждой итерации(количество объявлений), необходимо это исправить

async function getWeatherStart(date, location) {
	try {
		const weather = await WeatherWeek.findOne()
		let current = weather.list.find((elm) => elm.date == date && elm.city === location)
		current ??= []
		current.desc ??= 'Предсказываю погоду на более близкие даты...'
		current.desc = current.desc.charAt(0).toUpperCase() + current.desc.slice(1)
		return `Температура утром: ${current.tempMorn ?? '---'}°C\nТемпература днём: ${current.tempDay ?? '---'}°C\nТемпература вечером: ${current.tempEve ?? '---'}°C\nВлажность: ${current.humidity ?? '---'}%\nСкорость ветра: ${current.windSpeed ?? '---'}м/с\n${current.desc ?? '---'}`
	} catch { err => console.log(err) }
}

module.exports = getWeatherStart