const Message = require('../models/Message');

const deletePost = async (cbData, ctx) => {
	try {
		const forwardMess = cbData.replace(/ffmi/g, ''); //чистим callback_data от служебных символов ffmi
		// await ctx.telegram.deleteMessage(process.env.CHANNEL_TELEGRAM, forwardMess, 'привет!', 'Объявление не актуально! Удалено автором поста.')
		const secondsInTwoDay = 172800
		const millisecondInSecond = 1000
		//условие для поиска сообщений не старше двух дней
		const condition = (new Date().getTime() / millisecondInSecond) - secondsInTwoDay
		const cheсkForDel = await Message.findOne({
			$and: [
				{ "messageChannel.message_id": +forwardMess },
				{ "messageChannel.date": { $gt: condition } }
			]
		})
		if (await cheсkForDel) {
			await ctx.telegram.deleteMessage(process.env.CHANNEL_TELEGRAM, forwardMess).catch((error) => console.log(error))
			await Message.deleteOne({ "message.forward_from_message_id": +forwardMess })
		} else {
			await ctx.telegram.editMessageText(process.env.CHANNEL_TELEGRAM, forwardMess, 'привет!', 'Объявление не актуально! Удалено автором поста.').catch((error) => console.log(error))
			await Message.deleteOne({ "message.forward_from_message_id": +forwardMess })
		}
		await ctx.reply('Ваше объявление удалено!')
	} catch (error) {
		console.log(error)
	}
}
module.exports = deletePost