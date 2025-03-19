import { getInjection } from '@/src/di/container';
import { StudentDetailsDto } from '@/src/core/dtos/student';
import { NotFoundError } from '@/src/core/errors/common.error';
import { ServiceResponse, ServiceResponseFactory } from '@/src/core/domain/service-response.model';

export async function getStudentByIdUseCase(id: string): Promise<ServiceResponse<StudentDetailsDto>> {
  const studentService = getInjection('IStudentService');
  
  try {
    // Validate ID
    if (!id || typeof id !== 'string' || id.trim() === '') {
      return ServiceResponseFactory.createError(
        'Student ID is required',
        'INVALID_ID'
      );
    }
    
    const serviceResponse = await studentService.getStudentById(id);
    
    // If we got a proper ServiceResponse, just return it
    if (serviceResponse && typeof serviceResponse.success === 'boolean') {
      return serviceResponse as ServiceResponse<StudentDetailsDto>;
    }
    
    // If we got raw data directly (student object), wrap it in a ServiceResponse
    if (serviceResponse && typeof serviceResponse === 'object') {
      console.warn('StudentService.getStudentById returned raw data instead of ServiceResponse');
      return ServiceResponseFactory.createSuccess(serviceResponse as unknown as StudentDetailsDto);
    }
    
    // Handle unexpected response format
    return ServiceResponseFactory.createError(
      'Invalid response format from student service',
      'INVALID_RESPONSE_FORMAT'
    );
  } catch (error) {
    console.error('Error in getStudentByIdUseCase:', error);
    
    if (error instanceof NotFoundError) {
      return ServiceResponseFactory.createNotFound<StudentDetailsDto>('Student not found');
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve student data';
    return ServiceResponseFactory.createError<StudentDetailsDto>(
      errorMessage,
      'STUDENT_FETCH_ERROR'
    );
  }
}
