import { injectable, inject } from 'inversify';
import { IStudentService } from '@/src/application/ports/student.service.port';
import { StudentDto } from '@/src/core/dtos/student/student.dto';
import { ServiceResponse, ServiceResponseFactory } from '@/src/core/domain/service-response.model';
import { UnauthenticatedError } from '@/src/core/errors/authentication.error';
import { ApiRequestData } from '@/src/application/ports/api-client.port';
import { DI_SYMBOLS } from '@/src/di/types';
import { AuthenticatedApiClientService } from './authenticated-api-client.service';

@injectable()
export class StudentService implements IStudentService {
  constructor(
    @inject(DI_SYMBOLS.AuthenticatedApiClientService) private apiClient: AuthenticatedApiClientService
  ) {}
  
  private readonly baseUrl = '/api/Students';

  async getAllStudents(): Promise<ServiceResponse<StudentDto[]>> {
    try {
      return await this.apiClient.get<StudentDto[]>(this.baseUrl);
    } catch (error) {
      if (error instanceof UnauthenticatedError) {
        return ServiceResponseFactory.createError('No active session', 'SESSION_REQUIRED');
      }
      return ServiceResponseFactory.createError('Failed to fetch students', 'FETCH_STUDENTS_ERROR');
    }
  }

  async getStudentById(id: string): Promise<ServiceResponse<StudentDto>> {
    try {
      return await this.apiClient.get<StudentDto>(`${this.baseUrl}/${id}`);
    } catch (error) {
      if (error instanceof UnauthenticatedError) {
        return ServiceResponseFactory.createError('No active session', 'SESSION_REQUIRED');
      }
      return ServiceResponseFactory.createNotFound(`Student with ID ${id} not found`);
    }
  }

  async createStudent(student: Omit<StudentDto, 'id' | 'createdAt' | 'updatedAt'>): Promise<ServiceResponse<StudentDto>> {
    try {
      return await this.apiClient.post<StudentDto>(this.baseUrl, student as unknown as ApiRequestData);
    } catch (error) {
      if (error instanceof UnauthenticatedError) {
        return ServiceResponseFactory.createError('No active session', 'SESSION_REQUIRED');
      }
      return ServiceResponseFactory.createError('Failed to create student', 'CREATE_STUDENT_ERROR');
    }
  }

  async updateStudent(id: string, student: Partial<StudentDto>): Promise<ServiceResponse<StudentDto>> {
    try {
      return await this.apiClient.put<StudentDto>(`${this.baseUrl}/${id}`, student as unknown as ApiRequestData);
    } catch (error) {
      if (error instanceof UnauthenticatedError) {
        return ServiceResponseFactory.createError('No active session', 'SESSION_REQUIRED');
      }
      return ServiceResponseFactory.createError(`Failed to update student with ID ${id}`, 'UPDATE_STUDENT_ERROR');
    }
  }

  async deleteStudent(id: string): Promise<ServiceResponse<void>> {
    try {
      return await this.apiClient.delete<void>(`${this.baseUrl}/${id}`);
    } catch (error) {
      if (error instanceof UnauthenticatedError) {
        return ServiceResponseFactory.createError('No active session', 'SESSION_REQUIRED');
      }
      return ServiceResponseFactory.createError(`Failed to delete student with ID ${id}`, 'DELETE_STUDENT_ERROR');
    }
  }
}
