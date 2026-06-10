export interface DbExtraPoints {
  id: string;
  student_id: string;
  class_id: string;
  points: number;
  reason: string | null;
  awarded_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateExtraPointsData {
  student_id: string;
  class_id: string;
  points: number;
  reason?: string;
  awarded_by: string;
}
