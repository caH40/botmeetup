require('dotenv').config();
const fetch = require('node-fetch');
const cityList = require('./citylistru.json')
const WeatherWeek = require('../models/WeatherWeek');

const getWeatherDb = function () {
	let i = 0
	const cityMy = ['Kislovodsk', 'Pyatigorsk', 'Karachayevsk', 'Alagir', 'Arkhyz', 'Baksan', 'Nal’chik', 'Mineralnye Vody', 'Barashek', 'Yessentuki']
	const arrayWeather = []

	for (let x = 0; x < 10; x++) {

		let lon = cityList.filter(obj => obj.name === cityMy[x])[0].coord.lon
		let lat = cityList.filter(obj => obj.name === cityMy[x])[0].coord.lat

		const requestUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${process.env.IDWEATHER}&exclude=hourly&units=metric&lang=ru`
		fetch(requestUrl)
			.then(function (resp) {
				return resp.json()
			})
			.then(function (data) {
				for (let i = 0; i < 8; i = i + 1) {
					const weatherDate = new Date(data.daily[i].dt * 1000).toLocaleDateString();
					const weatherTempDay = data.daily[i].temp.day;
					const weatherTempMorn = data.daily[i].temp.morn;
					const weatherTempEve = data.daily[i].temp.eve;
					const weatherHumidity = data.daily[i].humidity;
					const weatherWindSpeed = data.daily[i].wind_speed;
					const weatherDescription = data.daily[i].weather[0].description;
					const dayWeather = new Date(data.daily[i].dt * 1000).getDay();
					const dayWeatherToday = new Date(data.daily[i].dt * 1000).toLocaleDateString();
					const dateUpdate = new Date().toLocaleString();

					const dayMyObj = {
						1: 'Понедельник',
						2: 'Вторник',
						3: 'Среда',
						4: 'Четверг',
						5: 'Пятница',
						6: 'Суббота',
						0: 'Воскресенье',
					}
					weatherDateRus = dayMyObj[dayWeather] + ' ' + weatherDate

					const cityMyObj = {
						'Kislovodsk': 'Кисловодск',
						'Pyatigorsk': 'Пятигорск',
						'Karachayevsk': 'Карачаевск',
						'Alagir': 'Алагир',
						'Arkhyz': 'Архыз',
						'Baksan': 'Баксан',
						'Nal’chik': 'Нальчик',
						'Mineralnye Vody': 'Минеральные Воды',
						'Barashek': 'Барашек',
						'Yessentuki': 'Ессентуки'
					}

					const zap = {
						'dateUpdate': dateUpdate,
						'date': weatherDate,
						'dateString': dayMyObj[dayWeather],
						'city': cityMyObj[cityMy[x]],
						'tempMorn': weatherTempMorn,
						'tempDay': weatherTempDay,
						'tempEve': weatherTempEve,
						'humidity': weatherHumidity,
						'windSpeed': weatherWindSpeed,
						'desc': weatherDescription
					}
					// формирование массива погоды с отфильтрованными данными
					arrayWeather.push(zap)
				}
				//обновление данных о погоде в базе данных, если нет, то создает новую коллекцию
				const week = async () => {
					const savedWeather = await WeatherWeek.findOne()
					if (savedWeather) {
						await WeatherWeek.findByIdAndUpdate(savedWeather.id, { list: arrayWeather })
					} else {
						const week = await new WeatherWeek({ list: arrayWeather })
						week.save()
					}
				}
				week()
			}
			)
			.catch((err) => console.log('Fetch - ' + err))
	};
}
module.exports = getWeatherDb
