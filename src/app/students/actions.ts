'use server';

import { getAllStudentsController } from '@/src/interface-adapters/controllers/students/get-all-students.controller';
import { getStudentByIdController } from '@/src/interface-adapters/controllers/students/get-student-by-id.controller';
import { createStudentController } from '@/src/interface-adapters/controllers/students/create-student.controller';
import { updateStudentController } from '@/src/interface-adapters/controllers/students/update-student.controller';
import { deleteStudentController } from '@/src/interface-adapters/controllers/students/delete-student.controller';
import { ServiceResponse } from "@/src/core/domain/service-response.model"; 
import { 
  StudentDto, 
  CreateStudentDto, 
  UpdateStudentDto, 
  StudentDetailsDto 
} from '@/src/core/dtos/student';

/**
 * Server action to get all students
 */
export async function getAllStudents(): Promise<ServiceResponse<StudentDto[]>> {
  return getAllStudentsController();
}

/**
 * Server action to get a student by ID
 */
export async function getStudentById(id: string): Promise<ServiceResponse<StudentDetailsDto>> {
  return getStudentByIdController(id);
}

/**
 * Server action to create a new student
 */
export async function createStudent(studentData: CreateStudentDto): Promise<ServiceResponse<StudentDto>> {
  return createStudentController(studentData);
}

/**
 * Server action to update a student
 */
export async function updateStudent(id: string, studentData: UpdateStudentDto): Promise<ServiceResponse<StudentDto>> {
  return updateStudentController(id, studentData);
}

/**
 * Server action to delete a student
 */
export async function deleteStudent(id: string): Promise<ServiceResponse<void>> {
  return deleteStudentController(id);
}
