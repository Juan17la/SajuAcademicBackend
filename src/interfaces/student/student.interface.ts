export interface DbStudent {
  id: string;
  class_id: string;
  student_code: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  added_at: Date;
}

export interface CreateStudentData {
  class_id: string;
  student_code: string;
  first_name: string;
  last_name: string;
}

export interface UpdateStudentData {
  student_code?: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
}
