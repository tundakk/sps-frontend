import { injectable } from 'inversify';
import { IStudentPresenter } from '@/src/application/ports/presenters/student-presenter.port';
import { StudentDto, StudentDetailsDto } from '@/src/core/dtos/student';
import { EntityPresenter } from './entity.presenter';

/**
 * Student presenter implementation for formatting student data for the UI
 */
@injectable()
export class StudentPresenter extends EntityPresenter<StudentDto, StudentDetailsDto> implements IStudentPresenter {
  /**
   * Format student data for presentation
   */
  protected formatData(student: StudentDto): StudentDto {
    if (!student) return student;
    
    return {
      ...student,
      // Format dates or apply other transformations needed for the UI
      finishedDate: this.formatDate(student.finishedDate),
      createdAt: this.formatDate(student.createdAt),
      updatedAt: this.formatDate(student.updatedAt),
      // Format creator/updater information if needed
      createdBy: student.createdBy || 'Unknown',
      updatedBy: student.updatedBy || student.createdBy || 'Unknown'
    };
  }
  
  /**
   * Format student details for presentation
   */
  protected formatDetails(studentDetails: StudentDetailsDto): StudentDetailsDto {
    if (!studentDetails) return studentDetails;
    
    return {
      ...studentDetails,
      // Format dates
      finishedDate: this.formatDate(studentDetails.finishedDate),
      createdAt: this.formatDate(studentDetails.createdAt),
      updatedAt: this.formatDate(studentDetails.updatedAt),
      // Format creator/updater information
      createdBy: studentDetails.createdBy || 'Unknown',
      updatedBy: studentDetails.updatedBy || studentDetails.createdBy || 'Unknown',
      
      // Format comments
      comments: studentDetails.comments?.map(comment => ({
        ...comment,
        createdAt: this.formatDate(comment.createdAt),
        createdBy: comment.createdBy || 'Unknown'
      })) || [],
      
      // Format SPSA cases
      spsaCases: studentDetails.spsaCases?.map(spsaCase => ({
        ...spsaCase,
        createdAt: this.formatDate(spsaCase.createdAt),
        updatedAt: this.formatDate(spsaCase.updatedAt),
        createdBy: spsaCase.createdBy || 'Unknown',
        updatedBy: spsaCase.updatedBy || spsaCase.createdBy || 'Unknown'
      })) || []
    };
  }
  
  /**
   * Utility method for formatting dates consistently
   */
  private formatDate(date: string | Date | null | undefined): string | null {
    if (!date) return null;
    
    try {
      // If it's already a string, format it as needed
      if (typeof date === 'string') {
        // Format the date string to desired format (e.g., 'YYYY-MM-DD')
        return new Date(date).toISOString().split('T')[0];
      }
      
      // If it's a Date object, format it
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting date:', error);
      return String(date);
    }
  }
}