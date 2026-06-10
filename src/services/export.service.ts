import type { PostgresDb } from '@fastify/postgres';
import ExcelJS from 'exceljs';
import * as classRepository from '../repositories/class.repository.js';
import * as studentRepository from '../repositories/student.repository.js';
import * as activityRepository from '../repositories/activity.repository.js';
import * as scoreRepository from '../repositories/score.repository.js';
import * as attendanceRepository from '../repositories/attendance.repository.js';
import * as extraPointsRepository from '../repositories/extra-points.repository.js';
import { NotFoundError } from '../utils/app-error.js';

export async function exportClassToExcel(
  pg: PostgresDb,
  classId: string,
  userId: string
): Promise<Buffer> {
  const classItem = await classRepository.findClassById(pg, classId, userId);
  if (!classItem) {
    throw new NotFoundError('Class not found');
  }

  const students = await studentRepository.findStudentsByClassId(pg, classId, userId);
  const activities = await activityRepository.findActivitiesByClassId(pg, classId, userId);
  const scores = await scoreRepository.findScoresByClassId(pg, classId, userId);
  const attendanceSessions = await attendanceRepository.findAttendanceSessionsByClassId(pg, classId, userId);
  const attendanceRecords = await attendanceRepository.findAttendanceRecordsByClassId(pg, classId, userId);
  const extraPoints = await extraPointsRepository.findExtraPointsByClassId(pg, classId, userId);

  const workbook = new ExcelJS.Workbook();

  // Sheet 1: Scores
  const scoresSheet = workbook.addWorksheet('Scores');
  scoresSheet.columns = [
    { header: 'Student Code', key: 'studentCode', width: 15 },
    { header: 'First Name', key: 'firstName', width: 15 },
    { header: 'Last Name', key: 'lastName', width: 15 },
    ...activities.map(a => ({ header: `${a.name} (${(a.weight * 100).toFixed(0)}%)`, key: a.id, width: 15 })),
    { header: 'Final Average', key: 'average', width: 15 },
  ];

  for (const student of students) {
    const row: any = {
      studentCode: student.student_code,
      firstName: student.first_name,
      lastName: student.last_name,
    };

    let totalWeighted = 0;
    let totalWeight = 0;

    for (const activity of activities) {
      const score = scores.find(s => s.student_id === student.id && s.activity_id === activity.id);
      if (score) {
        if (classItem.score_type === 'letters') {
          row[activity.id] = score.value_letter;
        } else {
          row[activity.id] = score.value_numeric;
        }
        
        const value = classItem.score_type === 'letters' 
          ? letterGradeToNumeric(score.value_letter || 'F')
          : (score.value_numeric || 0);
        totalWeighted += value * activity.weight;
        totalWeight += activity.weight;
      } else {
        row[activity.id] = '-';
      }
    }

    row.average = totalWeight > 0 ? (totalWeighted / totalWeight).toFixed(2) : '-';
    scoresSheet.addRow(row);
  }

  // Sheet 2: Attendance
  const attendanceSheet = workbook.addWorksheet('Attendance');
  attendanceSheet.columns = [
    { header: 'Student Code', key: 'studentCode', width: 15 },
    { header: 'First Name', key: 'firstName', width: 15 },
    { header: 'Last Name', key: 'lastName', width: 15 },
    ...attendanceSessions.map(s => ({ 
      header: new Date(s.session_date).toLocaleDateString(), 
      key: s.id, 
      width: 12 
    })),
    { header: 'Present', key: 'present', width: 10 },
    { header: 'Absent', key: 'absent', width: 10 },
    { header: 'Late', key: 'late', width: 10 },
    { header: 'Justified', key: 'justified', width: 10 },
  ];

  for (const student of students) {
    const row: any = {
      studentCode: student.student_code,
      firstName: student.first_name,
      lastName: student.last_name,
      present: 0,
      absent: 0,
      late: 0,
      justified: 0,
    };

    for (const session of attendanceSessions) {
      const record = attendanceRecords.find(r => r.session_id === session.id && r.student_id === student.id);
      if (record) {
        row[session.id] = record.status.charAt(0).toUpperCase();
        row[record.status]++;
      } else {
        row[session.id] = '-';
      }
    }

    attendanceSheet.addRow(row);
  }

  // Sheet 3: Extra Points
  const extraPointsSheet = workbook.addWorksheet('Extra Points');
  extraPointsSheet.columns = [
    { header: 'Student Code', key: 'studentCode', width: 15 },
    { header: 'First Name', key: 'firstName', width: 15 },
    { header: 'Last Name', key: 'lastName', width: 15 },
    { header: 'Points', key: 'points', width: 10 },
    { header: 'Reason', key: 'reason', width: 30 },
    { header: 'Date', key: 'date', width: 15 },
  ];

  for (const point of extraPoints) {
    const student = students.find(s => s.id === point.student_id);
    extraPointsSheet.addRow({
      studentCode: student?.student_code || 'Unknown',
      firstName: student?.first_name || 'Unknown',
      lastName: student?.last_name || 'Unknown',
      points: point.points,
      reason: point.reason || '-',
      date: new Date(point.created_at).toLocaleDateString(),
    });
  }

  // Sheet 4: Summary
  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.addRow(['Class Name', classItem.name]);
  summarySheet.addRow(['Score Type', classItem.score_type]);
  summarySheet.addRow(['Total Students', students.length]);
  summarySheet.addRow(['Total Activities', activities.length]);
  summarySheet.addRow(['Total Attendance Sessions', attendanceSessions.length]);
  summarySheet.addRow([]);
  summarySheet.addRow(['Attendance Breakdown']);
  summarySheet.addRow(['Status', 'Count']);
  
  const attendanceBreakdown = {
    present: attendanceRecords.filter(r => r.status === 'present').length,
    absent: attendanceRecords.filter(r => r.status === 'absent').length,
    late: attendanceRecords.filter(r => r.status === 'late').length,
    justified: attendanceRecords.filter(r => r.status === 'justified').length,
  };
  
  summarySheet.addRow(['Present', attendanceBreakdown.present]);
  summarySheet.addRow(['Absent', attendanceBreakdown.absent]);
  summarySheet.addRow(['Late', attendanceBreakdown.late]);
  summarySheet.addRow(['Justified', attendanceBreakdown.justified]);
  
  summarySheet.addRow([]);
  summarySheet.addRow(['Top Students']);
  summarySheet.addRow(['Rank', 'Student Code', 'Name', 'Average']);
  
  // Calculate top students
  const studentAverages = students.map(student => {
    const studentScores = scores.filter(s => s.student_id === student.id);
    let totalWeighted = 0;
    let totalWeight = 0;
    
    for (const score of studentScores) {
      const activity = activities.find(a => a.id === score.activity_id);
      if (activity) {
        const value = classItem.score_type === 'letters'
          ? letterGradeToNumeric(score.value_letter || 'F')
          : (score.value_numeric || 0);
        totalWeighted += value * activity.weight;
        totalWeight += activity.weight;
      }
    }
    
    return {
      student,
      average: totalWeight > 0 ? totalWeighted / totalWeight : 0,
    };
  }).sort((a, b) => b.average - a.average).slice(0, 10);
  
  studentAverages.forEach((s, index) => {
    summarySheet.addRow([
      index + 1,
      s.student.student_code,
      `${s.student.first_name} ${s.student.last_name}`,
      s.average.toFixed(2),
    ]);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

function letterGradeToNumeric(grade: string): number {
  const map: Record<string, number> = {
    'A': 95,
    'B': 85,
    'C': 75,
    'D': 65,
    'F+': 55,
    'F': 50,
    'F-': 45,
  };
  return map[grade] || 0;
}
