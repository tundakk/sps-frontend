import { getInjection } from '@/src/di/container';
import { ServiceResponse } from "@/src/core/domain/service-response.model"; 
import { StudentDto, UpdateStudentDto } from '@/src/core/dtos/student';
import { updateStudentUseCase } from '@/src/application/use-cases/students/update-student.use-case';
import { UnauthenticatedError } from '@/src/core/errors/authentication.error';

export async function updateStudentController(id: string, studentData: UpdateStudentDto): Promise<ServiceResponse<StudentDto>> {
  try {
    const useCaseResult = await updateStudentUseCase(id, studentData);
    
    // Get the presenter to format the response
    const presenter = getInjection('IStudentPresenter');
    return presenter.presentEntityUpdate(useCaseResult);
    
  } catch (error: unknown) {
    console.error('Error in updateStudentController:', error);
    
    if (error instanceof UnauthenticatedError) {
      return {
        success: false,
        message: 'Authentication required to update student',
        errorCode: 'UNAUTHENTICATED'
      };
    }
    
    return {
      success: false,
      message: error instanceof Error ? error.message : `Failed to update student with ID ${id}`,
      errorCode: 'UPDATE_STUDENT_ERROR'
    };
  }
}