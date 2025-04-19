import multer from 'multer';

/**
 * Multer configuration for file uploads
 */
const multerStorage = multer.memoryStorage();

export const multerUpload = multer({
	storage: multerStorage,
	limits: {
		fileSize: 10 * 1024 * 1024, // 10MB limit for all file uploads
	},
});
