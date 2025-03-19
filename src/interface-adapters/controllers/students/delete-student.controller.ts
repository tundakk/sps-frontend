import { ServiceResponse, ServiceResponseFactory } from '@/src/core/domain/service-response.model';
import { deleteStudentUseCase } from '@/src/application/use-cases/students/delete-student.use-case';

/**
 * Controller for deleting a student by ID
 * Validates input and passes data to the use case
 */
export async function deleteStudentController(
  id: string
): Promise<ServiceResponse<void>> {
  // Validate ID
  if (!id || typeof id !== 'string' || id.trim() === '') {
    return ServiceResponseFactory.createError(
      'Student ID is required',
      'INVALID_ID'
    );
  }

  // Call the use case
  return deleteStudentUseCase(id);
}