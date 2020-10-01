const keys = require('lodash/keys');
const isEmpty = require('lodash/isEmpty');

const updateDebts = require('./updateDebts');
const { getId, getDebt, messageWithRemove, editMessageTextWithRemove } = require('../../helpers/common');
const config = require('../../config');
const saveLog = require('../logs/saveLog');


const getRandom = () => ~~(Math.random() * 5);

module.exports = async (bot, msg) => {
  const
    chatId = getId(msg),
    message = (text, t) => messageWithRemove(bot, chatId, text, t || 3),
    editMessage = (text, options, t) => editMessageTextWithRemove(bot, chatId, text, options, t || 5);

  if (!config.get('dbConnected')) return message('База данных не подключена, попробуйте позже');

  const
    login = msg.from.username,
    query = { login, chatId },
    debt = await getDebt(bot, chatId, query),
    newDebt = {
      ...debt,
      total: 0,
      debts: {},
    };

  if (!debt) return message(`Пользователь ${login} не найден`);
  if (isEmpty(debt.debts)) return message(`У пользователя и так нет долгов`);

  const text = `${msg.from.first_name}, ты уверен, что всё отдал?`;
  const buttons = Array(5).fill({ text: 'Нет', callback_data: 'no' });
  const index = getRandom();
  buttons[index] = { text: 'Да', callback_data: 'yes' };

  const options = {
    reply_markup: JSON.stringify({
      resize_keyboard: true,
      inline_keyboard: [buttons],
    }),
  };

  bot.sendMessage(chatId, text, options);

  bot.on('callback_query', async callbackQuery => {

    const action = callbackQuery.data;
    const msg = callbackQuery.message;
    const opts = {
      chat_id: msg.chat.id,
      message_id: msg.message_id,
    };

    if (action === 'no') {
      return editMessage('Так чё ты тогда левые комманды клацаешь?', opts);
    }

    let successText = '';

    for (let i = 0; i < keys(debt.debts).length; i++) {
      const name = keys(debt.debts)[i];
      successText += `@${login} отдал @${name} ${Math.abs(debt.debts[name])}грн.\n`;
    }

    const status = await updateDebts({ bot, chatId, query, newDebt });

    if (status) {
      saveLog(chatId, successText);
      editMessage(successText, opts, 20)
    }
  });

};
