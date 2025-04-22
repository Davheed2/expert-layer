export interface IChatRooms {
	id: number;
	room_id: string; // Unique identifier for the chat room
	room_type: string; // Type of the room (e.g., 'direct', 'group', etc.)
	team_id: number | null; // ID of the team associated with the room, if any
	metadata: string; // JSON string containing additional metadata about the room
	created_at: Date;
	updated_at: Date;
}
