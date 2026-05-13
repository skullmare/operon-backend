const logger = require('../../utils/logger');
const { create, get } = require('../../../config/max');
const { onMessage, onCallback } = require('./handlers');

async function startPolling(bot) {
    while (true) {
        try {
            const updates = await bot.getUpdates(25);
            for (const update of updates) {
                try {
                    if (update.update_type === 'message_created') {
                        await onMessage(update.message);
                    } else if (update.update_type === 'message_callback') {
                        await onCallback(update.callback);
                    }
                } catch (err) {
                    logger.error('[MaxBot] Ошибка обработки обновления', null, err.message);
                }
            }
        } catch (err) {
            logger.error('[MaxBot] Ошибка получения обновлений', null, err.message);
            await new Promise(r => setTimeout(r, 3000));
        }
    }
}

function initMaxBot() {
    const { MAX_BOT_TOKEN } = process.env;
    if (!MAX_BOT_TOKEN) {
        logger.error('[MaxBot] MAX_BOT_TOKEN не задан, бот не запущен');
        return;
    }

    const bot = create(MAX_BOT_TOKEN);
    startPolling(bot).catch(err => logger.error('[MaxBot] Критическая ошибка polling', null, err.message));
    logger.success('[MaxBot] Бот запущен');
}

module.exports = { initMaxBot, getBot: get };
