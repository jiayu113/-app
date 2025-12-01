export enum TaskStatus {
  TODO = 'TODO',
  COMPLETED = 'COMPLETED'
}

export enum Priority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: Priority;
  estimatedMinutes: number;
  createdAt: number;
  dueDate?: string; // ISO string (YYYY-MM-DD or YYYY-MM-DDTHH:mm)
}

export interface FocusSession {
  id: string;
  durationMinutes: number;
  completedAt: string; // ISO Date string
  taskId?: string; // Optional: Link to a specific task
  taskTitle?: string; // Optional: Snapshot of task title
}

export enum AppTab {
  TASKS = 'TASKS',
  CALENDAR = 'CALENDAR',
  FOCUS = 'FOCUS',
  ANALYTICS = 'ANALYTICS'
}