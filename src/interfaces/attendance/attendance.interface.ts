export interface DbAttendanceSession {
  id: string;
  class_id: string;
  session_date: string;
  created_by: string;
  created_at: Date;
}

export interface DbAttendanceRecord {
  id: string;
  session_id: string;
  student_id: string;
  status: 'present' | 'absent' | 'late' | 'justified';
  created_at: Date;
  updated_at: Date;
}

export interface CreateAttendanceSessionData {
  class_id: string;
  session_date: string;
  created_by: string;
}

export interface CreateAttendanceRecordData {
  session_id: string;
  student_id: string;
  status: 'present' | 'absent' | 'late' | 'justified';
}

export interface UpdateAttendanceRecordData {
  status: 'present' | 'absent' | 'late' | 'justified';
}
