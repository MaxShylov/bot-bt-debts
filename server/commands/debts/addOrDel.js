const isEmpty = require('lodash/isEmpty');
const isInteger = require('lodash/isInteger');
const compact = require('lodash/compact');

const updateDebts = require('./updateDebts');
const { getId, getDebt, messageWithRemove, clearObj } = require('../../helpers/common');
const config = require('../../config');
const saveLog = require('../logs/saveLog');

const USER_I = ['@i', '@me', '@я', '@мне', '@мені', '@і', '@!'];

const checkErrors = (from, to, sum) => {
  let error = null;

  if (!config.get('dbConnected')) error = 'База данных не подключена, попробуйте позже';

  if (!from || !to || !sum) error = 'Команда введена неверно!';
  if (!from.includes('@') || !to.includes('@')) error = 'ЛОГИН должен содержать симлов "@"!';
  if (!isInteger(sum)) error = 'Ведите коректную сумму!';

  return error
};


module.exports = async (bot, msg, type) => {
  const
    chatId = getId(msg),
    fixUser = (login) => USER_I.includes(login.toLowerCase()) ? '@' + msg.from.username : login,
    m = compact(msg.text.split(' ')),
    isAdd = type === 'add',
    message = (text, t) => messageWithRemove(bot, chatId, text, t || 5);

  let
    from = fixUser(m[1]),
    to = fixUser(m[2]),
    sum = +m[3];

  const error = checkErrors(from, to, sum);

  if (error) return message(error);

  from = from.slice(1);
  to = to.slice(1);
  sum = +[isAdd ? sum : -sum];

  const
    fromQuery = { chatId, login: from },
    toQuery = { chatId, login: to },
    fromDebts = await getDebt(bot, chatId, fromQuery),
    toDebts = await getDebt(bot, chatId, toQuery);

  if (isEmpty(fromDebts) || isEmpty(toDebts)) return message(`@${isEmpty(toDebts) ? to : from} в базе не найден!`);

  if (type === 'del') {
    const dbts = fromDebts.debts;

    if (!dbts || !dbts[to]) return message(`Вы ничего не должны @${to}.`);
    if (dbts && dbts[to] < Math.abs(sum)) return message(`Вы должны @${to} всего лишь ${dbts[to]} грн.`);
  }

  let
    successText = '',
    status = true;

  if (type === 'add' && toDebts.debts && toDebts.debts[from]) {
    const dbt = +toDebts.debts[from];
    let fromSum = 0;

    if (sum < dbt) {
      fromSum = sum;
      sum = 0
    } else {
      fromSum = dbt;
      sum -= fromSum
    }

    const newToDebt = {
      ...toDebts,
      total: +toDebts.total - fromSum,
      debts: {
        ...toDebts.debts,
        [from]: dbt - fromSum
      }
    };

    successText += `Так как у @${to} есть долг @${from} в размере ${dbt} то:\n` +
      `@${to} отдал @${from} ${Math.abs(fromSum)}грн.\n`;

    clearObj(newToDebt.debts);

    status = await updateDebts({ bot, chatId, query: toQuery, newDebt: newToDebt });
  }

  if (status && sum) {
    const
      dbts = fromDebts.debts,
      newFromDebt = {
        ...fromDebts,
        total: +fromDebts.total + sum,
        debts: {
          ...dbts,
          [to]: dbts && dbts[to] ? +dbts[to] + sum : sum
        }
      };

    successText += `@${from} ${isAdd ? 'должен' : 'отдал'} @${to} ${Math.abs(sum)}грн.`;

    clearObj(newFromDebt.debts);

    status = await updateDebts({ bot, chatId, query: fromQuery, newDebt: newFromDebt });
  }

  if (status) {
    saveLog(chatId, successText);
    message(successText, 30)
  }

  return status;
};
