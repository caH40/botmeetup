require('dotenv').config();
const Message = require('../models/Message')
const getWeatherStart = require('./getweatherstart')

async function weatherUpdate(ctx) {
	try {
		const messageObj = await Message.find()
		messageObj.forEach(async elm => {
			const date = elm.messageChannel.text.match(/[0-9][0-9]\.[0-9][0-9]\.[0-9][0-9][0-9][0-9]/gm)[0]
			const location = elm.messageChannel.text.slice((elm.messageChannel.text.indexOf('Место: ') + 7), elm.messageChannel.text.indexOf('Дистанция:') - 1)

			await ctx.telegram.editMessageText(process.env.GROUP_TELEGRAM, elm.messageGroupWeather.message_id, 'привет!', await getWeatherStart(date, location) + `\nUpdate: ${new Date().toLocaleString()}`, { 'is_anonymous': false, 'correct_option_id': 0, 'reply_to_message_id': ctx.update.message.message_id, parse_mode: 'html' })
		})
	} catch { err => console.log(err) }
}


module.exports = weatherUpdate