import { StudentDto } from '@/src/core/dtos/student/student.dto';
import { ServiceResponse } from '@/src/core/domain/service-response.model';

export interface IStudentService {
  getAllStudents(): Promise<ServiceResponse<StudentDto[]>>;
  getStudentById(id: string): Promise<ServiceResponse<StudentDto>>;
  createStudent(student: Omit<StudentDto, 'id' | 'createdAt' | 'updatedAt'>): Promise<ServiceResponse<StudentDto>>;
  updateStudent(id: string, student: Partial<StudentDto>): Promise<ServiceResponse<StudentDto>>;
  deleteStudent(id: string): Promise<ServiceResponse<void>>;
}
