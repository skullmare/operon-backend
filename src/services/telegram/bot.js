const TelegramBot = require('node-telegram-bot-api');
const AgentUser = require('../../models/agent-user');
const { processMessage } = require('../agent');
const logger = require('../../utils/logger');

let bot = null;

const PHONE_REQUEST_KEYBOARD = {
    reply_markup: {
        keyboard: [[{ text: 'Поделиться номером телефона', request_contact: true }]],
        resize_keyboard: true,
        one_time_keyboard: true
    }
};

const REMOVE_KEYBOARD = {
    reply_markup: { remove_keyboard: true }
};

async function handleMessage(msg) {
    const chatId = String(msg.chat.id);
    const text = msg.text;

    if (text === '/start') {
        const user = await AgentUser.findOne({ chatId }).populate('role');
        if (!user) {
            return bot.sendMessage(
                chatId,
                'Добро пожаловать! Чтобы получить доступ к ИИ-агенту, поделитесь своим номером телефона.',
                PHONE_REQUEST_KEYBOARD
            );
        }
        if (!user.role) {
            return bot.sendMessage(
                chatId,
                'У вас пока что нет прав доступа, дождитесь когда вам разрешат использовать ИИ агента.',
                REMOVE_KEYBOARD
            );
        }
        return bot.sendMessage(chatId, 'Вы можете использовать ИИ-агента. Напишите ваш вопрос.', REMOVE_KEYBOARD);
    }

    const user = await AgentUser.findOne({ chatId }).populate('role');

    if (!user) {
        return bot.sendMessage(
            chatId,
            'Чтобы получить доступ к ИИ-агенту, поделитесь своим номером телефона.',
            PHONE_REQUEST_KEYBOARD
        );
    }

    if (!user.role) {
        return bot.sendMessage(
            chatId,
            'У вас пока что нет прав доступа, дождитесь когда вам разрешат использовать ИИ агента.'
        );
    }

    await AgentUser.findByIdAndUpdate(user._id, { lastActivity: new Date(), $inc: { requestsCount: 1 } });

    await bot.sendChatAction(chatId, 'typing');
    const reply = await processMessage(user, text);
    return bot.sendMessage(chatId, reply);
}

async function handleContact(msg) {
    const chatId = String(msg.chat.id);
    const contact = msg.contact;

    if (String(contact.user_id) !== String(msg.from.id)) {
        return bot.sendMessage(chatId, 'Пожалуйста, поделитесь своим собственным номером телефона.', PHONE_REQUEST_KEYBOARD);
    }

    const existing = await AgentUser.findOne({ chatId });
    if (existing) {
        if (!existing.role) {
            return bot.sendMessage(
                chatId,
                'Вы уже зарегистрированы. Дождитесь когда вам разрешат использовать ИИ агента.',
                REMOVE_KEYBOARD
            );
        }
        return bot.sendMessage(chatId, 'Вы уже зарегистрированы и можете использовать ИИ-агента.', REMOVE_KEYBOARD);
    }

    await AgentUser.create({
        chatId,
        phone: contact.phone_number,
        firstName: contact.first_name || msg.from.first_name,
        lastName: contact.last_name || msg.from.last_name || ''
    });

    return bot.sendMessage(
        chatId,
        'Спасибо! Вы успешно зарегистрированы. Дождитесь когда администратор предоставит вам доступ к ИИ-агенту.',
        REMOVE_KEYBOARD
    );
}

function initBot() {
    const token = process.env.TG_BOT_TOKEN;
    if (!token) {
        logger.error('[TelegramBot] TG_BOT_TOKEN не задан, бот не запущен');
        return;
    }

    bot = new TelegramBot(token, { polling: true });

    bot.on('message', async (msg) => {
        try {
            if (msg.contact) {
                await handleContact(msg);
            } else {
                await handleMessage(msg);
            }
        } catch (err) {
            logger.error('[TelegramBot] Ошибка обработки сообщения', null, err.message);
        }
    });

    bot.on('polling_error', (err) => {
        logger.error('[TelegramBot] Ошибка polling', null, err.message);
    });

    logger.success('[TelegramBot] Бот запущен');
}

function getBot() {
    return bot;
}

module.exports = { initBot, getBot };
