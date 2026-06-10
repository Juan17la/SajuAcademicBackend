import type { PostgresDb } from '@fastify/postgres';
import * as classRepository from '../repositories/class.repository.js';
import * as studentRepository from '../repositories/student.repository.js';
import * as activityRepository from '../repositories/activity.repository.js';
import * as scoreRepository from '../repositories/score.repository.js';
import * as attendanceRepository from '../repositories/attendance.repository.js';
import * as extraPointsRepository from '../repositories/extra-points.repository.js';
import { NotFoundError } from '../utils/app-error.js';

export async function getDashboard(pg: PostgresDb, classId: string, userId: string) {
  const classItem = await classRepository.findClassById(pg, classId, userId);
  if (!classItem) {
    throw new NotFoundError('Class not found');
  }

  // Get all students
  const students = await studentRepository.findStudentsByClassId(pg, classId, userId);
  
  // Get all activities
  const activities = await activityRepository.findActivitiesByClassId(pg, classId, userId);
  
  // Get all scores
  const scores = await scoreRepository.findScoresByClassId(pg, classId, userId);
  
  // Get all attendance records
  const attendanceRecords = await attendanceRepository.findAttendanceRecordsByClassId(pg, classId, userId);
  
  // Get all extra points
  const extraPoints = await extraPointsRepository.findExtraPointsByClassId(pg, classId, userId);
  
  // Calculate attendance breakdown
  const attendanceBreakdown = {
    present: attendanceRecords.filter(r => r.status === 'present').length,
    absent: attendanceRecords.filter(r => r.status === 'absent').length,
    late: attendanceRecords.filter(r => r.status === 'late').length,
    justified: attendanceRecords.filter(r => r.status === 'justified').length,
  };
  
  // Calculate student averages and attendance percentages
  const studentStats = students.map(student => {
    const studentScores = scores.filter(s => s.student_id === student.id);
    const studentAttendance = attendanceRecords.filter(r => r.student_id === student.id);
    const studentExtraPoints = extraPoints.filter(e => e.student_id === student.id);
    
    // Calculate weighted average
    let totalWeightedScore = 0;
    let totalWeight = 0;
    
    for (const score of studentScores) {
      const activity = activities.find(a => a.id === score.activity_id);
      if (activity) {
        let value = 0;
        if (classItem.score_type === 'letters') {
          value = letterGradeToNumeric(score.value_letter || 'F');
        } else {
          value = score.value_numeric || 0;
        }
        totalWeightedScore += value * activity.weight;
        totalWeight += activity.weight;
      }
    }
    
    const average = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
    
    // Calculate attendance percentage
    const totalSessions = new Set(attendanceRecords.map(r => r.session_id)).size;
    const presentCount = studentAttendance.filter(r => r.status === 'present').length;
    const lateCount = studentAttendance.filter(r => r.status === 'late').length;
    const attendancePercentage = totalSessions > 0 ? ((presentCount + lateCount) / totalSessions) * 100 : 0;
    
    // Calculate extra points total
    const extraPointsTotal = studentExtraPoints.reduce((sum, e) => sum + Number(e.points), 0);
    
    return {
      student,
      average: Number(average.toFixed(2)),
      attendancePercentage: Number(attendancePercentage.toFixed(2)),
      extraPointsTotal: Number(extraPointsTotal.toFixed(2)),
      totalSessions,
      presentCount,
      absentCount: studentAttendance.filter(r => r.status === 'absent').length,
      lateCount,
    };
  });
  
  // Top performing students
  const topStudents = [...studentStats]
    .sort((a, b) => b.average - a.average)
    .slice(0, 10)
    .map((s, index) => ({ ...s, rank: index + 1 }));
  
  // Students at risk (low average or frequent absences)
  const atRiskStudents = studentStats.filter(s => 
    s.average < 60 || s.attendancePercentage < 75
  ).sort((a, b) => a.average - b.average);
  
  // Summary statistics
  const totalSessions = new Set(attendanceRecords.map(r => r.session_id)).size;
  const classAverage = studentStats.length > 0 
    ? studentStats.reduce((sum, s) => sum + s.average, 0) / studentStats.length 
    : 0;
  
  return {
    class: classItem,
    summary: {
      totalStudents: students.length,
      totalActivities: activities.length,
      totalAttendanceSessions: totalSessions,
      classAverage: Number(classAverage.toFixed(2)),
    },
    attendanceBreakdown,
    topStudents,
    atRiskStudents,
  };
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
