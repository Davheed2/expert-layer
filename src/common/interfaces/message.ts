import { MessageStatus } from '../constants';

export interface IMessage {
	id: number;
	sender_id: string;
	recipient_id: number | null;
	team_id: number | null;
	room_id: number;
	room_type: string;
	content: string;
	status: MessageStatus;
	attachments: string[]; // Assuming attachments are stored as an array of strings (e.g., URLs or file paths)
	created_at: Date;
	updated_at: Date;
}

export interface IMessageReadReceipt {
    id: number;
    message_id: number;
    user_id: string;
    created_at: Date;
    updated_at: Date;
}
