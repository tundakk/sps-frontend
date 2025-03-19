import { getInjection } from '@/src/di/container';
import { NotFoundError } from '@/src/core/errors/common.error';
import { ServiceResponse, ServiceResponseFactory } from '@/src/core/domain/service-response.model';

export async function deleteStudentUseCase(id: string): Promise<ServiceResponse<void>> {
  const studentService = getInjection('IStudentService');
  
  try {
    // Validate ID
    if (!id || typeof id !== 'string' || id.trim() === '') {
      return ServiceResponseFactory.createError(
        'Student ID is required',
        'INVALID_ID'
      );
    }
    
    const serviceResponse = await studentService.deleteStudent(id);
    
    // If we got a proper ServiceResponse, just return it
    if (serviceResponse && typeof serviceResponse.success === 'boolean') {
      return serviceResponse;
    }
    
    // Handle unexpected response format
    return ServiceResponseFactory.createError(
      'Invalid response format from student service',
      'INVALID_RESPONSE_FORMAT'
    );
  } catch (error) {
    console.error('Error in deleteStudentUseCase:', error);
    
    if (error instanceof NotFoundError) {
      return ServiceResponseFactory.createNotFound<void>('Student not found');
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete student';
    return ServiceResponseFactory.createError<void>(
      errorMessage,
      'STUDENT_DELETE_ERROR'
    );
  }
}
