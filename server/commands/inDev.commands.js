const { getId } = require('../helpers/common');

const start = require('./help/start');

const addUser = require('./users/addUser');
const listUsers = require('./users/listUsers');

const getDebts = require('./debts/getDebts');
const addOrDel = require('./debts/addOrDel');
const delAll = require('./debts/delAll');

const getLogs = require('./logs/getLogs');

const sendMessageToAll = require('./help/sendMessageToAll');


const DEV_CHAT_ID = 629958368;


module.exports = (bot) => {

  bot.onText(/\/*/, async (msg) => {
    const chatId = getId(msg);

    if (chatId === DEV_CHAT_ID) {
      if (msg.text.includes('/start')) return await start(bot, msg);

      if (msg.text.includes('/add_user')) return await addUser(bot, msg);
      if (msg.text.includes('/list_users')) return await listUsers(bot, msg);

      if (msg.text.includes('/get_debts')) return await getDebts(bot, msg);
      if (msg.text.includes('/add ')) return await addOrDel(bot, msg, 'add');
      if (msg.text.includes('/del ')) return await addOrDel(bot, msg, 'del');
      if (msg.text.includes('/del_all')) return await delAll(bot, msg);

      if (msg.text.includes('/get_logs')) return await getLogs(bot, msg);

      if (msg.text.includes('/channel')) return await sendMessageToAll(bot, msg);

      return;
    }

    return bot
      .sendMessage(chatId, 'The bot in develop mode')
      .then((message) => setTimeout(() => bot.deleteMessage(chatId, message.message_id), 3000));
  });

};
