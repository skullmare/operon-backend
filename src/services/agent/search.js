const { qdrantClient } = require('../../../config/qdrant');

const COLLECTION = process.env.COLLECTION_NAME || 'knowledge_base';

async function searchChunks(queryVector, categoryName, roleId) {
    const must = [{ key: 'metadata.accessibleByRoles', match: { value: roleId } }];
    // if (categoryName) must.push({ key: 'metadata.category', match: { value: categoryName } });

    return qdrantClient.search(COLLECTION, {
        vector: queryVector,
        filter: { must },
        limit: 5,
        with_payload: true
    });
}

module.exports = { searchChunks };
