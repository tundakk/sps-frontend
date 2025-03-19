import { ServiceResponse, ServiceResponseFactory } from '@/src/core/domain/service-response.model';
import { StudentDto } from '@/src/core/dtos/student/student.dto';
import { updateStudentUseCase } from '@/src/application/use-cases/students/update-student.use-case';
import { z } from 'zod';

// Validation schema for student update
const updateStudentSchema = z.object({
  name: z.object({
    value: z.string().min(2, 'Name must be at least 2 characters').max(100)
  }).optional(),
  studentNumber: z.string().min(1, 'Student number is required').optional(),
  cprNumber: z.object({
    value: z.string().min(10, 'CPR number must be at least 10 digits').max(10)
  }).optional(),
  startPeriodId: z.string().uuid('Start period ID must be a valid UUID').optional(),
  educationId: z.string().uuid('Education ID must be a valid UUID').optional(),
  finishedDate: z.union([z.string(), z.date(), z.null()]).optional(),
}).strict();

type UpdateStudentRequest = z.infer<typeof updateStudentSchema>;

/**
 * Controller for updating a student
 * Validates input and passes data to the use case
 */
export async function updateStudentController(
  id: string,
  studentData: UpdateStudentRequest
): Promise<ServiceResponse<StudentDto>> {
  try {
    // Validate ID
    if (!id || typeof id !== 'string' || id.trim() === '') {
      return ServiceResponseFactory.createError(
        'Student ID is required',
        'INVALID_ID'
      );
    }
    
    // Validate student data
    const validationResult = updateStudentSchema.safeParse(studentData);
    
    if (!validationResult.success) {
      const errors: Record<string, string[]> = {};
      validationResult.error.errors.forEach(err => {
        const path = err.path.join('.');
        if (!errors[path]) errors[path] = [];
        errors[path].push(err.message);
      });
      
      return ServiceResponseFactory.createValidationError(errors);
    }
    
    // Call the use case with validated data
    return updateStudentUseCase(id, studentData);
  } catch (error) {
    console.error('Error in updateStudentController:', error);
    return ServiceResponseFactory.createError(
      error instanceof Error ? error.message : 'Failed to update student',
      'CONTROLLER_ERROR'
    );
  }
}