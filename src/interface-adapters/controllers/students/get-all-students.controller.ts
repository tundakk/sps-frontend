import { ServiceResponse, ServiceResponseFactory } from "@/src/core/domain/service-response.model"; 
import { StudentDto } from '@/src/core/dtos/student/student.dto';
import { getAllStudentsUseCase } from '@/src/application/use-cases/students/get-all-students.use-case';
import { UnauthenticatedError } from '@/src/core/errors/authentication.error';

export async function getAllStudentsController(): Promise<ServiceResponse<StudentDto[]>> {
  try {
    // Just return the ServiceResponse from use case - don't wrap it again
    return await getAllStudentsUseCase();
  } catch (error: unknown) {
    console.error('Error in getAllStudentsController:', error);
    
    // Provide better error handling with specific error types
    if (error instanceof UnauthenticatedError) {
      return ServiceResponseFactory.createError<StudentDto[]>(
        error.message, 
        'SESSION_REQUIRED'
      );
    }
    
    // Get error message safely
    const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve students';
    const errorCode = 'STUDENT_FETCH_ERROR';
    
    // Use factory method for error responses
    return ServiceResponseFactory.createError<StudentDto[]>(errorMessage, errorCode);
  }
}