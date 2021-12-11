const Message = require('../models/Message')

async function pollCountUpdate(ctx) {
	try {
		if (ctx.update.poll_answer.option_ids[0] === 0) {
			await Message.updateOne({ "messageGroupPoll.poll.id": ctx.update.poll_answer.poll_id }, { $inc: { pollCount: 1 } })
			const currentPoll = await Message.findOne({ "messageGroupPoll.poll.id": ctx.update.poll_answer.poll_id })
			const messageId = currentPoll.messageChannel.message_id
			await ctx.telegram.editMessageText(process.env.CHANNEL_TELEGRAM, messageId, 'привет!', currentPoll.messageChannel.text + `\n` + 'Участвуют: ' + currentPoll.pollCount + ' 🚵', { parse_mode: 'html' })
		}
	} catch { (error) => console.log(error) }
}

module.exports = pollCountUpdate