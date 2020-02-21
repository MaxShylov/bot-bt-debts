const isEmpty = require('lodash').isEmpty;

const { getId, messageWithRemove } = require('../../helpers/common');
const DebtsModel = require('../../db/models/debts.model');
const config = require('../../config');

module.exports = async (bot, msg) => {
  const
    chatId = getId(msg),
    message = (text, t) => messageWithRemove(bot, chatId, text, t || 3);

  if (!config.get('dbConnected')) return message('База данных не подключена, попробуйте позже');

  let users = await DebtsModel.find({ chatId }, (err) => {
    if (err) return bot.sendMessage(chatId, JSON.stringify(err));
  });


  if (isEmpty(users)) return message('Пользователи еще не созданы.');

  let textUsers = 'Пользователи: \n';

  users.map(i => textUsers += `${i.name} - ${i.login}\n`);

  return message(textUsers, 5);
};
