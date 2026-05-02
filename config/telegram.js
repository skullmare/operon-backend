const TelegramBot = require('node-telegram-bot-api');

let _bot = null;

const create = (token) => (_bot = new TelegramBot(token, { polling: true }));
const get = () => _bot;

module.exports = { create, get };
