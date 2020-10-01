const { getId, messageWithRemove } = require('../../helpers/common');

const schedule = require('node-schedule');
const { getDebts } = require('../debts/index');
const config = require('../../config');

const startText = `
Данный бот был создан для контроля за долгами между людьми.
Изначально добавьте всех ползователей воспользовавшись командой
/add_user [ИМЯ] [ЛОГИН]
Потом вы сможете добавлять (/add) и удалять (/del) долги:
/add(del) [ЛОГИН_КТО] [ЛОГИН_КОМУ] [СУММА]

Или же вывести их вручную командой /get_debts

Про все команды вы можете узнать воспользовавшись командой /help
`;


module.exports = async (bot, msg) => {
  const chatId = getId(msg);

  bot.sendMessage(chatId, startText);

  return schedule.scheduleJob({ date: 11 }, async () => {
    const str = await getDebts();

    bot.sendMessage(chatId, str);
  });
};
