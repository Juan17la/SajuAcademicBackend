import type { PostgresDb } from '@fastify/postgres';
import * as studentRepository from '../repositories/student.repository.js';
import * as classRepository from '../repositories/class.repository.js';
import type { CreateStudentDto, UpdateStudentDto, ImportStudentsDto } from '../schemas/student.schema.js';
import { ConflictError, NotFoundError, BadRequestError } from '../utils/app-error.js';

export async function getStudentsByClassId(pg: PostgresDb, classId: string, userId: string) {
  // Verify class belongs to user
  const classItem = await classRepository.findClassById(pg, classId, userId);
  if (!classItem) {
    throw new NotFoundError('Class not found');
  }

  return await studentRepository.findStudentsByClassId(pg, classId, userId);
}

export async function createStudent(pg: PostgresDb, classId: string, userId: string, dto: CreateStudentDto) {
  // Verify class belongs to user
  const classItem = await classRepository.findClassById(pg, classId, userId);
  if (!classItem) {
    throw new NotFoundError('Class not found');
  }

  try {
    return await studentRepository.createStudent(pg, {
      class_id: classId,
      student_code: dto.student_code,
      first_name: dto.first_name,
      last_name: dto.last_name,
    });
  } catch (error: any) {
    if (error.code === '23505') {
      throw new ConflictError('Student code already exists in this class');
    }
    throw error;
  }
}

export async function updateStudent(pg: PostgresDb, id: string, userId: string, dto: UpdateStudentDto) {
  const student = await studentRepository.findStudentById(pg, id, userId);
  if (!student) {
    throw new NotFoundError('Student not found');
  }

  try {
    const updated = await studentRepository.updateStudent(pg, id, userId, {
      student_code: dto.student_code,
      first_name: dto.first_name,
      last_name: dto.last_name,
      is_active: dto.is_active,
    });
    if (!updated) {
      throw new NotFoundError('Student not found');
    }
    return updated;
  } catch (error: any) {
    if (error.code === '23505') {
      throw new ConflictError('Student code already exists in this class');
    }
    throw error;
  }
}

export async function deleteStudent(pg: PostgresDb, id: string, userId: string) {
  const student = await studentRepository.findStudentById(pg, id, userId);
  if (!student) {
    throw new NotFoundError('Student not found');
  }

  await studentRepository.deleteStudent(pg, id, userId);
}

export async function importStudents(pg: PostgresDb, classId: string, userId: string, dto: ImportStudentsDto) {
  // Verify class belongs to user
  const classItem = await classRepository.findClassById(pg, classId, userId);
  if (!classItem) {
    throw new NotFoundError('Class not found');
  }

  const lines = dto.students.split('\n').filter(line => line.trim());
  const imported: any[] = [];
  const errors: { line: string; error: string }[] = [];

  for (const line of lines) {
    const match = line.match(/^\s*\[\s*([^,\]]+)\s*,\s*([^,\]]+)\s*,\s*([^\]]+)\s*\]\s*$/);
    if (!match) {
      errors.push({ line: line.trim(), error: 'Invalid format. Expected: [Student Code, First Name, Last Name]' });
      continue;
    }

    const [, student_code, first_name, last_name] = match;

    try {
      const student = await studentRepository.createStudent(pg, {
        class_id: classId,
        student_code: student_code.trim(),
        first_name: first_name.trim(),
        last_name: last_name.trim(),
      });
      imported.push(student);
    } catch (error: any) {
      if (error.code === '23505') {
        errors.push({ line: line.trim(), error: 'Student code already exists in this class' });
      } else {
        errors.push({ line: line.trim(), error: error.message || 'Unknown error' });
      }
    }
  }

  return { imported, errors };
}
