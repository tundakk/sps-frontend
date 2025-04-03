import { StudentDto, StudentDetailsDto } from '@/src/core/dtos/student';
import { IEntityPresenter } from './base-presenter.port';

/**
 * Interface for student presenter operations
 */
export interface IStudentPresenter extends IEntityPresenter<StudentDto, StudentDetailsDto> {
  // Add any student-specific presentation methods here if needed
}