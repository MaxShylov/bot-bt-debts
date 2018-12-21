const getDebts = require('./getDebts');
const addOrDel = require('./addOrDel');
const delAll = require('./delAll');


module.exports = (bot) => {

  bot.onText(/\/get_debts/, async (msg) => await getDebts(bot, msg));

  bot.onText(/\/add (.+)/, async (msg) => await addOrDel('add', bot, msg));
  bot.onText(/\/add@bt_debts_bot (.+)/, async (msg) => await addOrDel('add', bot, msg));

  bot.onText(/\/del (.+)/, async (msg) => await addOrDel('del', bot, msg));
  bot.onText(/\/del@bt_debts_bot (.+)/, async (msg) => await addOrDel('del', bot, msg));

  bot.onText(/\/del_all/, async (msg) => await delAll(bot, msg));

};