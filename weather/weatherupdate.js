require('dotenv').config();
const Message = require('../models/Message');
const getWeatherStart = require('./getweatherstart');

async function weatherUpdate(bot) {
  try {
    const messageObj = await Message.find();

    messageObj.forEach(async (elm) => {
      const date = elm.messageChannel.text.match(
        /[0-9][0-9]\.[0-9][0-9]\.[0-9][0-9][0-9][0-9]/gm
      )[0];
      const location = elm.messageChannel.text.slice(
        elm.messageChannel.text.indexOf('Место: ') + 7,
        elm.messageChannel.text.indexOf('Дистанция:') - 1
      );

      const dateArr = date.split('.');
      const lag = 80000000;
      let dateNewFormat = [dateArr[1], dateArr[0], dateArr[2]].join('.');
      let dateMilliseconds = new Date(dateNewFormat).getTime() + lag;
      let todayMilliseconds = new Date().getTime();

      if (dateMilliseconds > todayMilliseconds) {
        await bot.telegram
          .editMessageText(
            process.env.GROUP_TELEGRAM,
            elm.messageGroupWeather.message_id,
            'привет!',
            ((await getWeatherStart(date, location))
              ? await getWeatherStart(date, location)
              : 'Необходимо подождать, скоро я смогу предсказать погоду') +
              `\nUpdate: ${new Date().toLocaleString()}`,
            {
              is_anonymous: false,
              correct_option_id: 0,
              reply_to_message_id:
                elm.messageGroupWeather.reply_to_message.message_id,
              parse_mode: 'html',
            }
          )
          .catch((error) => console.log(error));
      }
    });
  } catch {
    (err) => console.log(err);
  }
}

module.exports = weatherUpdate;
