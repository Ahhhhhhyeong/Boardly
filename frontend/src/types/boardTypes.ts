// ── Types ────────────────────────────────────────────────────────────────────

export interface Board {
  id: string;
  userId: string;
  title: string;
  description: string;
  color: string;
  createdAt: string;
}

export interface Column {
  id: string;
  boardId: string;
  title: string;
  color: string;
  order: number;
}

export interface Card {
  id: string;
  columnId: string;
  boardId: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  progress: number;
  startDate: string;
  deadline: string;
  order: number;
  createdAt: string;
}

export type View = "auth" | "dashboard" | "board";