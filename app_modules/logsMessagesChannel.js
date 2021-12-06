// модуль для сохранения всех сообщений, которые видит botcurrant
const Message = require('../models/Message')

const logsMessagesChannel = async function (messageObj) {
	const messageLog = new Message({ message: messageObj })
	await messageLog.save().catch((err) => console.log(err))
}
module.exports = logsMessagesChannel