const { getId } = require('../../helpers/common');

const helpText = `
/add - Добавить долг (/add [ЛОГИН_КТО] [ЛОГИН_КОМУ] [СУММА]) *
/del - Отдать долг (/del [ЛОГИН_КТО] [ЛОГИН_КОМУ] [СУММА]) *
/get_debts - Получить список долгов
/get_logs - Получить список логов
/add_user - Добавление пользователя (/add [ИМЯ] [ЛОГИН])
/list_users - Показать всех пользователей
/get_chat_id - Получить chatId 


* В комaнде /add & /del вместо логина можно писать @i, @I, @me для того чтоб бот использовал ваш логин
`;


module.exports = (bot, msg) => bot.sendMessage(getId(msg), helpText);
