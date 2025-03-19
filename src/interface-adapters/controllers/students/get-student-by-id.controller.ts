import { ServiceResponse } from '@/src/core/domain/service-response.model';
import { StudentDto } from '@/src/core/dtos/student/student.dto';
import { getStudentByIdUseCase } from '@/src/application/use-cases/students/get-student-by-id.use-case';

/**
 * Controller for retrieving a student by ID
 * Validates input and passes data to the use case
 */
export async function getStudentByIdController(
  id: string
): Promise<ServiceResponse<StudentDto>> {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    return {
      success: false,
      message: 'Student ID is required',
      errorCode: 'INVALID_ID',
      data: null
    };
  }

  // Call the use case
  return getStudentByIdUseCase(id);
}