// модуль для сохранения всех сообщений, которые видит botcurrant
const Message = require('../models/Message')

const logsMessagesChannel = async function (messageChannel) {
	const messageLog = new Message({ messageChannel: messageChannel })
	await messageLog.save().catch((err) => console.log(err))
}

const updateMessage = async function (messageObjId, messageObjPoll, messageObjWeather) {
	await Message.updateOne({ "messageChannel.message_id": messageObjId }, { "messageGroupPoll": messageObjPoll })
	await Message.updateOne({ "messageChannel.message_id": messageObjId }, { "messageGroupWeather": messageObjWeather })
}


module.exports.logsMessagesChannel = logsMessagesChannel
module.exports.updateMessage = updateMessage