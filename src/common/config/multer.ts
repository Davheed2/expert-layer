import multer from 'multer';

/**
 * Multer configuration for file uploads
 */
const multerStorage = multer.memoryStorage();

export const multerUpload = multer({
	storage: multerStorage,
	limits: {
		fileSize: 100 * 1024 * 1024, // 100MB limit for all file uploads
	},
});
