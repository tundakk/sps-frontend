import { getInjection } from '@/src/di/container';
import { ServiceResponse } from "@/src/core/domain/service-response.model"; 
import { StudentDetailsDto } from '@/src/core/dtos/student';
import { getStudentByIdUseCase } from '@/src/application/use-cases/students/get-student-by-id.use-case';
import { UnauthenticatedError } from '@/src/core/errors/authentication.error';

export async function getStudentByIdController(id: string): Promise<ServiceResponse<StudentDetailsDto>> {
  try {
    const useCaseResult = await getStudentByIdUseCase(id);
    
    // Get the presenter to format the response
    const presenter = getInjection('IStudentPresenter');
    return presenter.presentEntityDetails(useCaseResult);
    
  } catch (error: unknown) {
    console.error('Error in getStudentByIdController:', error);
    
    if (error instanceof UnauthenticatedError) {
      return {
        success: false,
        message: 'Authentication required to access student data',
        errorCode: 'UNAUTHENTICATED'
      };
    }
    
    return {
      success: false,
      message: error instanceof Error ? error.message : `Failed to retrieve student with ID ${id}`,
      errorCode: 'GET_STUDENT_ERROR'
    };
  }
}