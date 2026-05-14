const axios = require('axios');

const BASE_URL = 'https://botapi.max.ru';

let _client = null;

const create = (token) => {
    let marker = null;

    _client = {
        async getUpdates(timeout = 25) {
            const params = { access_token: token, timeout, limit: 100 };
            if (marker != null) params.marker = marker;
            const { data } = await axios.get(`${BASE_URL}/updates`, {
                params,
                timeout: (timeout + 5) * 1000
            });
            if (data.marker != null) marker = data.marker;
            return data.updates || [];
        },

        async sendMessage(userId, text, attachments = []) {
            const body = {
                recipient: { user_id: userId },
                type: 'text',
                body: { text }
            };
            if (attachments.length) body.attachments = attachments;
            await axios.post(`${BASE_URL}/messages`, body, {
                params: { access_token: token }
            });
        },

        async sendTyping(userId) {
            await axios.post(
                `${BASE_URL}/chats/${userId}/actions`,
                { action: 'typing_on' },
                { params: { access_token: token } }
            ).catch(() => {});
        }
    };

    return _client;
};

const get = () => _client;

module.exports = { create, get };
