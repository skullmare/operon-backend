module.exports = {
    phoneRequest: {
        reply_markup: {
            keyboard: [[{ text: 'Поделиться номером телефона', request_contact: true }]],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    },
    remove: {
        reply_markup: { remove_keyboard: true }
    }
};
