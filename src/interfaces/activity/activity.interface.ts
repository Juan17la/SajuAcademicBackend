export interface DbActivity {
  id: string;
  class_id: string;
  name: string;
  description: string | null;
  weight: number;
  activity_type: 'assignment' | 'project' | 'quiz' | 'exam';
  is_deleted: boolean;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateActivityData {
  class_id: string;
  name: string;
  description?: string;
  weight: number;
  activity_type: 'assignment' | 'project' | 'quiz' | 'exam';
}

export interface UpdateActivityData {
  name?: string;
  description?: string;
  weight?: number;
  activity_type?: 'assignment' | 'project' | 'quiz' | 'exam';
}
