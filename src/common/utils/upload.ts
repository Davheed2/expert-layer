import { ENVIRONMENT } from '@/common/config';
import type { IAwsUploadFile } from '@/common/interfaces';
import AppError from './appError';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { isValidPhotoNameAwsUpload } from './helper';
import sharp from 'sharp';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

if (
	!ENVIRONMENT.R2.ACCOUNT_ID ||
	!ENVIRONMENT.R2.REGION ||
	!ENVIRONMENT.R2.ACCESS_KEY_ID ||
	!ENVIRONMENT.R2.SECRET_ACCESS_KEY ||
	!ENVIRONMENT.R2.BUCKET_NAME ||
	!ENVIRONMENT.R2.CDN_URL ||
	!ENVIRONMENT.R2.PUBLIC_URL
) {
	throw new Error('R2 environment variables are not set');
}

export const r2 = new S3Client({
	region: ENVIRONMENT.R2.REGION,
	endpoint: `https://${ENVIRONMENT.R2.ACCOUNT_ID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: ENVIRONMENT.R2.ACCESS_KEY_ID,
		secretAccessKey: ENVIRONMENT.R2.SECRET_ACCESS_KEY,
	},
});

/**
 * Generates a pre-signed URL for uploading a course video to Cloudflare R2.
 */
export const generatePresignedUrl = async (fileName: string, fileType: string, fileSize: number) => {
	const maxSize = 500 * 1024 * 1024; //500mb
	const validVideoTypes = ['video/mp4', 'video/mov', 'video/webm', 'video/avi'];

	if (!validVideoTypes.includes(fileType)) {
		throw new AppError('Invalid video format. Supported formats: mp4, mov, webm, avi', 400);
	}

	if (fileSize > maxSize) {
		throw new AppError('File size exceeds 500MB limit', 400);
	}

	const key = `course-videos/${Date.now()}-${fileName}`;
	const command = new PutObjectCommand({
		Bucket: ENVIRONMENT.R2.BUCKET_NAME,
		Key: key,
		ContentType: fileType,
	});

	const signedUrl = await getSignedUrl(r2, command, { expiresIn: 600 });

	return { signedUrl, key };
};

export const uploadPictureFile = async (payload: IAwsUploadFile): Promise<{ secureUrl: string }> => {
	const { fileName, buffer, mimetype } = payload;

	if (!fileName || !buffer || !mimetype) {
		throw new AppError('File name, buffer and mimetype are required', 400);
	}

	const MAX_FILE_SIZE = 8 * 1024 * 1024;
	if (buffer.length > MAX_FILE_SIZE) {
		throw new AppError('Photo size exceeds 8MB limit', 400);
	}

	if (fileName && !isValidPhotoNameAwsUpload(fileName)) {
		throw new AppError('Invalid file name', 400);
	}

	let bufferFile = buffer;

	if (mimetype.includes('image')) {
		bufferFile = await sharp(buffer)
			.resize({
				height: 1920,
				width: 1080,
				fit: 'contain',
			})
			.toBuffer();
	}

	const uploadParams = {
		Bucket: ENVIRONMENT.R2.BUCKET_NAME,
		Key: fileName,
		Body: bufferFile,
		ContentType: mimetype,
	};

	try {
		const command = new PutObjectCommand(uploadParams);
		await r2.send(command);
		const secureUrl = `${ENVIRONMENT.R2.PUBLIC_URL}/${fileName}`;

		return { secureUrl };
	} catch (error) {
		console.log(error);
		return {
			secureUrl: '',
		};
	}
};

export const uploadDocumentFile = async (payload: IAwsUploadFile): Promise<{ secureUrl: string }> => {
	const { fileName, buffer, mimetype } = payload;

	if (!fileName || !buffer || !mimetype) {
		throw new AppError('File name, buffer, and mimetype are required', 400);
	}

	const MAX_FILE_SIZE = 50 * 1024 * 1024;
	if (buffer.length > MAX_FILE_SIZE) {
		throw new AppError('File size exceeds 50MB limit', 400);
	}

	const validDocumentTypes = [
		'application/pdf',
		'application/msword',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	];
	if (!validDocumentTypes.includes(mimetype)) {
		throw new AppError('Invalid document format. Supported formats: pdf, doc, docx', 400);
	}

	const uploadParams = {
		Bucket: ENVIRONMENT.R2.BUCKET_NAME,
		Key: fileName,
		Body: buffer,
		ContentType: mimetype,
	};

	try {
		const command = new PutObjectCommand(uploadParams);
		await r2.send(command);

		const secureUrl = `${ENVIRONMENT.R2.PUBLIC_URL}/${fileName}`;

		return { secureUrl };
	} catch (error) {
		console.log(error);
		throw new AppError('Error uploading document to R2', 500);
	}
};

const extractObjectKey = (fileUrl: string): string | null => {
	const match = fileUrl.match(/\.r2\.dev\/(.+)/);
	return match ? match[1] : null;
};

export const deleteObjectFromR2 = async (fileUrl: string) => {
	try {
		const objectKey = extractObjectKey(fileUrl);
		if (!objectKey) {
			return false;
		}

		const command = new DeleteObjectCommand({
			Bucket: ENVIRONMENT.R2.BUCKET_NAME,
			Key: objectKey,
		});

		await r2.send(command);
		console.log(`Deleted: ${objectKey}`);
	} catch (error) {
		console.error('Error deleting object:', error);
		throw error;
	}
};
