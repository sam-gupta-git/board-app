export interface Note {
	id: string;
	text: string;
	x: number;
	y: number;
	color: string;
	createdAt: number;
	updatedAt: number;
}

export interface Drawing {
	id: string;
	boardId: string;
	points: Array<{x: number, y: number}>;
	color: string;
	strokeWidth: number;
	createdAt: number;
}

export interface Board {
	id: string;
	createdAt: number;
	lastAccessedAt: number;
	notes: Note[];
	drawings: Drawing[];
}
