import { getInjection } from '@/src/di/container';
import { StudentDto } from '@/src/core/dtos/student/student.dto';
import { NotFoundError } from '@/src/core/errors/common.error';
import { ServiceResponse, ServiceResponseFactory } from '@/src/core/domain/service-response.model';

export async function getAllStudentsUseCase(): Promise<ServiceResponse<StudentDto[]>> {
  const studentService = getInjection('IStudentService');
  
  try {
    // Get the service response from the service
    const serviceResponse = await studentService.getAllStudents();
    
    // If we got a proper ServiceResponse, just return it
    if (serviceResponse && typeof serviceResponse.success === 'boolean') {
      return serviceResponse;
    }
    
    // If we got raw data directly (array of students), wrap it in a ServiceResponse
    if (Array.isArray(serviceResponse)) {
      console.warn('StudentService.getAllStudents returned raw data instead of ServiceResponse');
      return ServiceResponseFactory.createSuccess(serviceResponse);
    }
    
    // Handle unexpected response format
    return ServiceResponseFactory.createError(
      'Invalid response format from student service',
      'INVALID_RESPONSE_FORMAT'
    );
  } catch (error) {
    console.error('Error in getAllStudentsUseCase:', error);
    
    if (error instanceof NotFoundError) {
      return ServiceResponseFactory.createNotFound<StudentDto[]>('No students found');
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve students data';
    return ServiceResponseFactory.createError<StudentDto[]>(
      errorMessage,
      'STUDENTS_FETCH_ERROR'
    );
  }
}