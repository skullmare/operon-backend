const { PutObjectCommand, DeleteObjectsCommand, ListObjectsV2Command } = require("@aws-sdk/client-s3");
const path = require('path');
const { s3Client } = require('../../config/yandexcloud');

/**
 * Загрузка одного файла
 */
async function uploadFileToYandex(file, fileInfo, topicId) {
    try {
        const extension = path.extname(file.originalname);
        const safeName = Date.now() + '_' + Math.floor(Math.random() * 1000);
        const key = `topics/${topicId}/${safeName}${extension}`;

        const uploadParams = {
            Bucket: process.env.BUCKET_NAME,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype || 'application/octet-stream',
            ACL: 'public-read'
        };

        await s3Client.send(new PutObjectCommand(uploadParams));

        const permanentUrl = `https://storage.yandexcloud.net/${process.env.BUCKET_NAME}/${key}`;
        
        return {
            name: fileInfo.name,          // Красивое имя из мапы
            description: fileInfo.description, // Описание из мапы
            url: permanentUrl,
            fileType: file.mimetype
        };
    } catch (error) {
        console.error(`❌ Ошибка загрузки файла ${file.originalname}:`, error.message);
        throw error;
    }
}

/**
 * Процесс обработки всех файлов
 */
async function processTopicFiles(files, filesMetadataMap, topicId) {
    if (!files || files.length === 0) return [];
    
    const uploadPromises = files.map((file) => {
        // Мы уже провалидировали наличие данных в контроллере, так что тут просто берем
        const fileInfo = filesMetadataMap[file.originalname];
        return uploadFileToYandex(file, fileInfo, topicId);
    });

    return await Promise.all(uploadPromises);
}

/**
 * Удаление всех файлов, связанных с конкретным топиком
 * @param {string|number} topicId - ID удаляемого топика
 */
async function deleteTopicFiles(topicId) {
    try {
        const bucketName = process.env.BUCKET_NAME;
        const prefix = `topics/${topicId}/`;

        // 1. Получаем список всех объектов в "папке" топика
        const listParams = {
            Bucket: bucketName,
            Prefix: prefix,
        };

        const listedObjects = await s3Client.send(new ListObjectsV2Command(listParams));

        // Если файлов нет, просто выходим
        if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
            console.log(`ℹ️ Файлы для топика ${topicId} не найдены в S3.`);
            return;
        }

        // 2. Формируем массив ключей для удаления
        const deleteParams = {
            Bucket: bucketName,
            Delete: {
                Objects: listedObjects.Contents.map(({ Key }) => ({ Key })),
                Quiet: false // Чтобы получить подтверждение удаления каждого объекта
            }
        };

        // 3. Выполняем массовое удаление
        const deletionResult = await s3Client.send(new DeleteObjectsCommand(deleteParams));
        
        console.log(`✅ Успешно удалено файлов: ${deletionResult.Deleted?.length} для топика ${topicId}`);
        return deletionResult;

    } catch (error) {
        console.error(`❌ Ошибка при удалении файлов топика ${topicId}:`, error.message);
        throw error;
    }
}

async function deleteSingleFileFromS3(fileUrl) {
    try {
        // Извлекаем ключ из URL (https://storage.yandexcloud.net/bucket/key)
        const urlParts = fileUrl.split('.net/')[1];
        const key = urlParts.split('/').slice(1).join('/'); // Убираем имя бакета

        await s3Client.send(new DeleteObjectCommand({
            Bucket: process.env.BUCKET_NAME,
            Key: key
        }));
    } catch (error) {
        console.error(`⚠️ Не удалось удалить файл ${fileUrl} из S3:`, error.message);
    }
}

module.exports = { 
    processTopicFiles,
    deleteTopicFiles,
    deleteSingleFileFromS3 // Не забудьте экспортировать
};