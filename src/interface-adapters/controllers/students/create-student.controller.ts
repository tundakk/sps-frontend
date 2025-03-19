import { ServiceResponse, ServiceResponseFactory } from '@/src/core/domain/service-response.model';
import { StudentDto } from '@/src/core/dtos/student/student.dto';
import { createStudentUseCase } from '@/src/application/use-cases/students/create-student.use-case';
import { z } from 'zod';

// Validation schema for student creation
const createStudentSchema = z.object({
  name: z.object({
    value: z.string().min(2, 'Name must be at least 2 characters').max(100)
  }),
  studentNumber: z.string().min(1, 'Student number is required'),
  cprNumber: z.object({
    value: z.string().min(10, 'CPR number must be at least 10 digits').max(10)
  }),
  startPeriodId: z.string().uuid('Start period ID must be a valid UUID'),
  educationId: z.string().uuid('Education ID must be a valid UUID'),
});

type CreateStudentRequest = z.infer<typeof createStudentSchema>;

/**
 * Controller for creating a new student
 * Validates input and passes data to the use case
 */
export async function createStudentController(
  studentData: CreateStudentRequest
): Promise<ServiceResponse<StudentDto>> {
  try {
    // Validate input
    const validationResult = createStudentSchema.safeParse(studentData);
    
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
    return createStudentUseCase(studentData);
  } catch (error) {
    console.error('Error in createStudentController:', error);
    return ServiceResponseFactory.createError(
      error instanceof Error ? error.message : 'Failed to create student',
      'CONTROLLER_ERROR'
    );
  }
}