import { getInjection } from '@/src/di/container';
import { StudentDto } from '@/src/core/dtos/student/student.dto';
import { CreateStudentDto, createStudentDtoSchema } from '@/src/core/dtos/student/create-student.dto';
import { ServiceResponse, ServiceResponseFactory } from '@/src/core/domain/service-response.model';

export async function createStudentUseCase(
  studentData: CreateStudentDto
): Promise<ServiceResponse<StudentDto>> {
  const studentService = getInjection('IStudentService');
  
  try {
    // Validate using the zod schema
    const parseResult = createStudentDtoSchema.safeParse(studentData);
    
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
    
    const serviceResponse = await studentService.createStudent({
      ...studentData,
      comments: [],
      spsaCases: []
    });
    
    // If we got a proper ServiceResponse, extract data from it
    if (serviceResponse && typeof serviceResponse.success === 'boolean') {
      if (serviceResponse.success && serviceResponse.data) {
        // If successful, we need to create a new response with the unwrapped data
        return ServiceResponseFactory.createSuccess(serviceResponse.data);
      } else {
        // If it's an error, return the error response
        return serviceResponse as ServiceResponse<StudentDto>;
      }
    }
    
    // Handle raw data response (unexpected but covered)
    if (serviceResponse && typeof serviceResponse === 'object') {
      console.warn('StudentService.createStudent returned raw data instead of ServiceResponse');
      return ServiceResponseFactory.createSuccess(serviceResponse as unknown as StudentDto);
    }
    
    return ServiceResponseFactory.createError(
      'Invalid response format from student service',
      'INVALID_RESPONSE_FORMAT'
    );
  } catch (error) {
    console.error('Error in createStudentUseCase:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to create student';
    return ServiceResponseFactory.createError<StudentDto>(
      errorMessage,
      'STUDENT_CREATE_ERROR'
    );
  }
}
