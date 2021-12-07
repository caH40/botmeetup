const Message = require('../models/Message')

async function pollCountUpdate(ctx) {
	if (ctx.update.poll_answer.option_ids[0] === 0) {
		try {
			await Message.updateOne({ "messageGroupPoll.poll.id": ctx.update.poll_answer.poll_id }, { $inc: { pollCount: 1 } })
			const pollId = await Message.findOne({ "messageGroupPoll.poll.id": ctx.update.poll_answer.poll_id })

			await ctx.telegram.editMessageText(process.env.CHANNEL_TELEGRAM, pollId.messageChannel.message_id, 'привет!', pollId.messageChannel.text + `\n` + 'Участвуют: ' + pollId.pollCount + ' 🚵')
		} catch { err => console.log(err) }
	}
}

module.exports = pollCountUpdate