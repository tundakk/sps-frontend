import { getInjection } from '@/src/di/container';
import { ServiceResponse } from "@/src/core/domain/service-response.model"; 
import { deleteStudentUseCase } from '@/src/application/use-cases/students/delete-student.use-case';
import { UnauthenticatedError } from '@/src/core/errors/authentication.error';

export async function deleteStudentController(id: string): Promise<ServiceResponse<void>> {
  try {
    const useCaseResult = await deleteStudentUseCase(id);
    
    // Get the presenter to format the response
    const presenter = getInjection('IStudentPresenter');
    return presenter.presentEntityDeletion(useCaseResult);
    
  } catch (error: unknown) {
    console.error('Error in deleteStudentController:', error);
    
    if (error instanceof UnauthenticatedError) {
      return {
        success: false,
        message: 'Authentication required to delete student',
        errorCode: 'UNAUTHENTICATED'
      };
    }
    
    return {
      success: false,
      message: error instanceof Error ? error.message : `Failed to delete student with ID ${id}`,
      errorCode: 'DELETE_STUDENT_ERROR'
    };
  }
}