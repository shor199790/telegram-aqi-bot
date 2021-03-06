const TelegramBot = require('node-telegram-bot-api');
const pinyin = require('pinyin');
const request = require('request');
const program = require('commander');

program
  .version('2.0.1')
  .option('-t, --token [value]', 'Telegram Bot Token')
  .parse(process.argv);


const bot = new TelegramBot(program.token, {
  polling: true,
  onlyFirstMatch: true,
});

bot.onText(/^\/aqi$/, (msg) => {
  bot.sendMessage(msg.chat.id, '例: /aqi 济南  (城市名支持中文、繁体中文、拼音、英文)');
});

bot.onText(/\/aqi (.+)/, (msg, match) => {
  let city = match[1];
  const re = /[^\u4e00-\u9fa5]|[\uFE30-\uFFA0]/;
  if (!re.test(city)) {
    city = pinyin(city, {
      segment: true,
      style: pinyin.STYLE_NORMAL,
    });
    city = city.join('');
  }

  console.log(`query ${city} city`);
  request(`http://aqicn.org/aqicn/json/android/${city}/json`, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const res = JSON.parse(body);
      if (res.wgt) {
        console.log(res.wgt);
        bot.sendPhoto(msg.chat.id, res.wgt);
      }
    } else {
      console.error(error);
    }
  });
});

bot.on('polling_error', (error) => {
  console.error(error.code);
  console.error(error.response);
});
