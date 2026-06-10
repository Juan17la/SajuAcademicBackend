export interface DbClass {
  id: string;
  user_id: string;
  name: string;
  score_type: 'numeric' | 'percentage' | 'letters';
  is_deleted: boolean;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateClassData {
  user_id: string;
  name: string;
  score_type: 'numeric' | 'percentage' | 'letters';
}

export interface UpdateClassData {
  name?: string;
  score_type?: 'numeric' | 'percentage' | 'letters';
}
