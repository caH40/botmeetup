const Message = require('../models/Message');

const deletePost = async (cbData, ctx) => {
  try {
    const forwardMess = Number(cbData.replace(/ffmi/g, '')); //чистим callback_data от служебных символов ffmi
    const secondsInTwoDay = 172800;
    const millisecondInSecond = 1000;
    //условие для поиска сообщений не старше двух дней
    const condition =
      new Date().getTime() / millisecondInSecond - secondsInTwoDay;
    const checkForDel = await Message.findOne({
      $and: [
        { 'messageChannel.message_id': forwardMess },
        { 'messageChannel.date': { $gt: condition } },
      ],
    }).exec();
    if (checkForDel) {
      await ctx.telegram
        .deleteMessage(process.env.CHANNEL_TELEGRAM, forwardMess)
        .catch((error) => console.log(error));
      await Message.findOneAndDelete({
        'messageChannel.message_id': forwardMess,
      }).exec();
      await ctx
        .reply('Ваше объявление удалено!')
        .catch((error) => console.log(error));
    } else {
      await ctx.telegram
        .editMessageText(
          process.env.CHANNEL_TELEGRAM,
          forwardMess,
          'привет!',
          'Объявление не актуально! Удалено автором поста.'
        )
        .catch((error) => console.log(error));
      await Message.findOneAndDelete({
        'messageChannel.message_id': forwardMess,
      }).exec();
      await ctx
        .reply(
          'Вашему объявлению больше двух дней, поэтому оно будет удалено администратором канала!'
        )
        .catch((error) => console.log(error));
    }
  } catch (error) {
    console.log(error);
  }
};
module.exports = deletePost;
