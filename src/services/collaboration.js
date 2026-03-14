const { Hocuspocus } = require('@hocuspocus/server');
const { Tiptap } = require('@hocuspocus/transformer');
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

const hocuspocus = new Hocuspocus();

const hocuspocusConfigured = hocuspocus.configure({
    debounce: 3000,

    async onAuthenticate({ token, context }) {
        if (!token) throw new Error('Токен не предоставлен');
        const userData = validateAccessToken(token);
        if (!userData) throw new Error('Неверный или просроченный токен');
        logger.success('[WS] Аутентификация пройдена успешно');
        context.user = userData;
    },

    async onLoadDocument({ documentName }) {
        const topic = await Topic.findById(documentName).select('+collaborationData');
        return topic?.collaborationData || null;
    },

    async onStoreDocument({ documentName, state, document, context }) {
        try {
            const tiptap = new Tiptap();
            const jsonContent = tiptap.fromYdoc(document);
            const blocks = jsonContent.default;
            const plainText = extractPlainText(blocks);

            await Topic.findByIdAndUpdate(documentName, {
                collaborationData: state,
                content: blocks,
                plainTextContent: plainText,
                updatedBy: context.user.id,
            });

            logger.success(`[WS] документ сохранён: ${documentName}`);
        } catch (error) {
            logger.error('[Collaboration-Error]', 500, error);
        }
    },
});

module.exports = hocuspocusConfigured;