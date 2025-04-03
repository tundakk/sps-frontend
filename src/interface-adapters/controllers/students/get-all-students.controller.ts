import { getInjection } from '@/src/di/container';
import { ServiceResponse } from "@/src/core/domain/service-response.model"; 
import { StudentDto } from '@/src/core/dtos/student/student.dto';
import { getAllStudentsUseCase } from '@/src/application/use-cases/students/get-all-students.use-case';
import { UnauthenticatedError } from '@/src/core/errors/authentication.error';

export async function getAllStudentsController(): Promise<ServiceResponse<StudentDto[]>> {
  try {
    // Execute the use case to get all students
    const useCaseResult = await getAllStudentsUseCase();
    
    // Get the presenter to format the response
    const presenter = getInjection('IStudentPresenter');
    return presenter.presentEntityCollection(useCaseResult);
    
  } catch (error: unknown) {
    console.error('Error in getAllStudentsController:', error);
    
    if (error instanceof UnauthenticatedError) {
      return {
        success: false,
        message: 'Authentication required to access student data',
        errorCode: 'UNAUTHENTICATED'
      };
    }
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to retrieve students',
      errorCode: 'GET_STUDENTS_ERROR'
    };
  }
}