import { getInjection } from '@/src/di/container';
import { ServiceResponse } from "@/src/core/domain/service-response.model"; 
import { StudentDto, CreateStudentDto } from '@/src/core/dtos/student';
import { createStudentUseCase } from '@/src/application/use-cases/students/create-student.use-case';
import { UnauthenticatedError } from '@/src/core/errors/authentication.error';

export async function createStudentController(studentData: CreateStudentDto): Promise<ServiceResponse<StudentDto>> {
  try {
    const useCaseResult = await createStudentUseCase(studentData);
    
    // Get the presenter to format the response
    const presenter = getInjection('IStudentPresenter');
    return presenter.presentEntityCreation(useCaseResult);
    
  } catch (error: unknown) {
    console.error('Error in createStudentController:', error);
    
    if (error instanceof UnauthenticatedError) {
      return {
        success: false,
        message: 'Authentication required to create student',
        errorCode: 'UNAUTHENTICATED'
      };
    }
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create student',
      errorCode: 'CREATE_STUDENT_ERROR'
    };
  }
}