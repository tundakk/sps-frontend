import { getInjection } from '@/src/di/container';
import { StudentDto } from '@/src/core/dtos/student/student.dto';
import { UpdateStudentDto, updateStudentDtoSchema } from '@/src/core/dtos/student/update-student.dto';
import { ServiceResponse, ServiceResponseFactory } from '@/src/core/domain/service-response.model';

export async function updateStudentUseCase(
  id: string,
  studentData: UpdateStudentDto
): Promise<ServiceResponse<StudentDto>> {
  const studentService = getInjection('IStudentService');
  
  try {
    // Validate ID
    if (!id || typeof id !== 'string' || id.trim() === '') {
      return ServiceResponseFactory.createError(
        'Student ID is required',
        'INVALID_ID'
      );
    }
    
    // Validate using the zod schema
    const parseResult = updateStudentDtoSchema.safeParse(studentData);
    
    if (!parseResult.success) {
      const validationErrors: Record<string, string[]> = {};
      
      parseResult.error.errors.forEach(err => {
        const path = err.path.join('.');
        if (!validationErrors[path]) validationErrors[path] = [];
        validationErrors[path].push(err.message);
      });
      
      return ServiceResponseFactory.createValidationError<StudentDto>(
        validationErrors,
        'Student data validation failed'
      );
    }
    
    const serviceResponse = await studentService.updateStudent(id, studentData);
    
    // If we got a proper ServiceResponse, return it
    if (serviceResponse && typeof serviceResponse.success === 'boolean') {
      return serviceResponse;
    }
    
    // Handle raw data response (unexpected but covered)
    if (serviceResponse && typeof serviceResponse === 'object') {
      console.warn('StudentService.updateStudent returned raw data instead of ServiceResponse');
      return ServiceResponseFactory.createSuccess(serviceResponse as unknown as StudentDto);
    }
    
    return ServiceResponseFactory.createError(
      'Invalid response format from student service',
      'INVALID_RESPONSE_FORMAT'
    );
  } catch (error) {
    console.error('Error in updateStudentUseCase:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to update student';
    return ServiceResponseFactory.createError<StudentDto>(
      errorMessage,
      'STUDENT_UPDATE_ERROR'
    );
  }
}
