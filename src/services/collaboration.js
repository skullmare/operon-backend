const { Hocuspocus } = require('@hocuspocus/server');
const { TiptapTransformer } = require('@hocuspocus/transformer');
const Topic = require('../models/topic');
const { validateAccessToken } = require('../services/auth.service');
const logger = require('../utils/logger');

function extractPlainText(blocks) {
    if (!Array.isArray(blocks)) return '';
    return blocks
        .map((block) => {
            let text = '';
            
            if (Array.isArray(block.content)) {
                text = block.content.map((c) => c.text || '').join(' ');
            }
            
            if (block.props) {
                if (block.props.url) {
                    text += ' ' + block.props.url;
                }
                if (block.props.caption) {
                    text += ' ' + block.props.caption;
                }
            }

            if (block.children && block.children.length > 0) {
                text += ' ' + extractPlainText(block.children);
            }
            return text;
        })
        .join(' ')
        .trim()
        .replace(/\s+/g, ' ');
}

const server = new Hocuspocus({
    port: 1234,
    debounce: 3000,

    async onAuthenticate({ token }) {
        if (!token) throw new Error('Токен не предоставлен');
        const userData = validateAccessToken(token);
        if (!userData) throw new Error('Неверный или просроченный токен');
        return { user: userData };
    },

    async onLoadDocument({ documentName }) {
        const topic = await Topic.findById(documentName).select('+collaborationData');
        return topic?.collaborationData;
    },

    async onStoreDocument({ documentName, state, document }) {
        const jsonContent = TiptapTransformer.fromYDoc(document);
        const blocks = jsonContent.default;
        const plainText = extractPlainText(blocks);

        try {
            await Topic.findByIdAndUpdate(documentName, {
                collaborationData: state,      // Бинарный слепок для Yjs
                content: blocks,               // JSON для фронтенда и обычного API
                plainTextContent: plainText,   // Текст для полнотекстового индекса
            });
        } catch (error) {
            logger.error('[Collaboration-Error]', 500, error);
        }
    },
});

server.listen();