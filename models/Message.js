// коллекция, состоящяя из объекта сообщения ctx.message
const { Schema, model } = require('mongoose')
const messageSchema = new Schema({
	messageChannel: {
		type: Object
	},
	messageGroupPoll: {
		type: Object
	},
	messageGroupWeather: {
		type: Object
	},
	pollCount: {
		type: Number,
		default: 0
	}
})
module.exports = model('messages', messageSchema)