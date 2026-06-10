export interface DbScore {
  id: string;
  activity_id: string;
  student_id: string;
  value_numeric: number | null;
  value_letter: string | null;
  scored_by: string;
  scored_at: Date;
  updated_at: Date;
}

export interface CreateScoreData {
  activity_id: string;
  student_id: string;
  value_numeric?: number;
  value_letter?: string;
  scored_by: string;
}

export interface UpdateScoreData {
  value_numeric?: number;
  value_letter?: string;
}
