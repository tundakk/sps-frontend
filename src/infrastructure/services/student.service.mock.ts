import { injectable } from 'inversify';
import { IStudentService } from '@/src/application/ports/student.service.port';
import { StudentDto } from '@/src/core/dtos/student/student.dto';
import { ServiceResponse, ServiceResponseFactory } from '@/src/core/domain/service-response.model';
import crypto from 'crypto';

@injectable()
export class MockStudentService implements IStudentService {
  private mockStudents: StudentDto[] = [
    {
      id: crypto.randomUUID(),
      studentNumber: '12345678',
      cprNumber: '1203367890',
      name: 'John Doe',
      educationId: crypto.randomUUID(),
      startPeriodId: crypto.randomUUID(),
      finishedDate: null
    },
    {
      id: crypto.randomUUID(),
      studentNumber: '12345678',
      cprNumber: '1203363241',
      name: 'Jane Smith',
      educationId: crypto.randomUUID(),
      startPeriodId: crypto.randomUUID(),
      finishedDate: new Date('2023-12-15')
    }
  ];

  async getAllStudents(): Promise<ServiceResponse<StudentDto[]>> {
    return ServiceResponseFactory.createSuccess(this.mockStudents);
  }

  async getStudentById(id: string): Promise<ServiceResponse<StudentDto>> {
    const student = this.mockStudents.find(s => s.id === id);
    
    if (!student) {
      return ServiceResponseFactory.createNotFound(`Student with ID ${id} not found`);
    }
    
    return ServiceResponseFactory.createSuccess(student);
  }

  async createStudent(student: Omit<StudentDto, 'id'>): Promise<ServiceResponse<StudentDto>> {
    const newStudent: StudentDto = {
      ...student,
      id: crypto.randomUUID()
    };
    
    this.mockStudents.push(newStudent);
    return ServiceResponseFactory.createSuccess(newStudent);
  }

  async updateStudent(id: string, student: Partial<StudentDto>): Promise<ServiceResponse<StudentDto>> {
    const index = this.mockStudents.findIndex(s => s.id === id);
    
    if (index === -1) {
      return ServiceResponseFactory.createNotFound(`Student with ID ${id} not found`);
    }
    
    const updatedStudent = {
      ...this.mockStudents[index],
      ...student
    };
    
    this.mockStudents[index] = updatedStudent;
    return ServiceResponseFactory.createSuccess(updatedStudent);
  }

  async deleteStudent(id: string): Promise<ServiceResponse<void>> {
    const index = this.mockStudents.findIndex(s => s.id === id);
    
    if (index === -1) {
      return ServiceResponseFactory.createNotFound(`Student with ID ${id} not found`);
    }
    
    this.mockStudents.splice(index, 1);
    return ServiceResponseFactory.createSuccess(undefined);
  }
}