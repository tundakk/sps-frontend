'use client';

import { useEffect, useState } from 'react';
import { getAllStudents, getStudentById, createStudent, updateStudent, deleteStudent } from './actions';
import { StudentDto } from '@/src/core/dtos/student/student.dto';
import { ServiceResponse } from '@/src/core/domain/service-response.model';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/app/_components/ui/card';
import { Button } from '@/src/app/_components/ui/button';
import { Input } from '@/src/app/_components/ui/input';
import { Select } from '@/src/app/_components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/app/_components/ui/dialog';
import { Label } from '@/src/app/_components/ui/label';

type StudentModalData = {
  name: {
    value: string;
  };
  studentNumber: string;
  cprNumber: {
    value: string;
  };
  educationId: string;
  startPeriodId: string;
  finishedDate?: string | null;
};

export default function StudentsPage() {
  const [students, setStudents] = useState<StudentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentStudent, setCurrentStudent] = useState<StudentDto | null>(null);
  const [studentData, setStudentData] = useState<StudentModalData>({
    name: { value: '' },
    studentNumber: '',
    cprNumber: { value: '' },
    educationId: '',
    startPeriodId: '',
    finishedDate: null
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [processingAction, setProcessingAction] = useState(false);
  
  // Fetch all students on page load
  useEffect(() => {
    fetchStudents();
  }, []);
  
  async function fetchStudents() {
    try {
      setLoading(true);
      const response = await getAllStudents();
      
      if (response.success && response.data) {
        setStudents(response.data);
        setError(null);
      } else {
        setError(response.message || 'Failed to load students');
      }
    } catch (err) {
      setError('An error occurred while fetching students');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  
  // Handle form input changes
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    
    if (name === 'name') {
      setStudentData(prev => ({ ...prev, name: { value } }));
    } else if (name === 'cprNumber') {
      setStudentData(prev => ({ ...prev, cprNumber: { value } }));
    } else {
      setStudentData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear validation error for this field if it exists
    if (validationErrors[name]) {
      const newErrors = { ...validationErrors };
      delete newErrors[name];
      setValidationErrors(newErrors);
    }
  }
  
  // Open modal for creating a new student
  function handleAddStudent() {
    setModalMode('create');
    setCurrentStudent(null);
    setStudentData({
      name: { value: '' },
      studentNumber: '',
      cprNumber: { value: '' },
      educationId: '',
      startPeriodId: '',
      finishedDate: null
    });
    setValidationErrors({});
    setShowModal(true);
  }
  
  // Open modal for editing an existing student
  async function handleEditStudent(id: string) {
    try {
      setProcessingAction(true);
      const response = await getStudentById(id);
      
      if (response.success && response.data) {
        setCurrentStudent(response.data);
        setStudentData({
          name: response.data.name,
          studentNumber: response.data.studentNumber,
          cprNumber: response.data.cprNumber,
          educationId: response.data.educationId || '',
          startPeriodId: response.data.startPeriodId || '',
          finishedDate: response.data.finishedDate 
            ? (typeof response.data.finishedDate === 'string' 
                ? response.data.finishedDate 
                : new Date(response.data.finishedDate).toISOString())
            : null
        });
        setModalMode('edit');
        setValidationErrors({});
        setShowModal(true);
      } else {
        setStatusMessage(`Error: ${response.message}`);
      }
    } catch (err) {
      setStatusMessage('Failed to load student details');
      console.error(err);
    } finally {
      setProcessingAction(false);
    }
  }
  
  // Handle form submission for both create and edit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProcessingAction(true);
    setValidationErrors({});
    
    try {
      let response: ServiceResponse<StudentDto>;
      
      if (modalMode === 'create') {
        response = await createStudent(studentData);
      } else {
        if (!currentStudent?.id) {
          throw new Error('Student ID is missing for update');
        }
        response = await updateStudent(currentStudent.id, studentData);
      }
      
      if (response.success) {
        setShowModal(false);
        setStatusMessage(
          modalMode === 'create' 
            ? 'Student created successfully' 
            : 'Student updated successfully'
        );
        fetchStudents();
      } else {
        if (response.validationErrors) {
          setValidationErrors(response.validationErrors);
        }
        setStatusMessage(`Error: ${response.message}`);
      }
    } catch (err) {
      setStatusMessage(
        modalMode === 'create' 
          ? 'Failed to create student' 
          : 'Failed to update student'
      );
      console.error(err);
    } finally {
      setProcessingAction(false);
    }
  }
  
  // Handle student deletion
  async function handleDeleteStudent(id: string) {
    if (!window.confirm('Are you sure you want to delete this student?')) {
      return;
    }
    
    try {
      setProcessingAction(true);
      const response = await deleteStudent(id);
      
      if (response.success) {
        setStatusMessage('Student deleted successfully');
        fetchStudents();
      } else {
        setStatusMessage(`Error: ${response.message}`);
      }
    } catch (err) {
      setStatusMessage('Failed to delete student');
      console.error(err);
    } finally {
      setProcessingAction(false);
    }
  }
  
  if (loading) return <div className="flex justify-center items-center h-64">Studerende hentes...</div>;
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Students</CardTitle>
        <Button 
          onClick={handleAddStudent}
          disabled={processingAction}
        >
          Add New Student
        </Button>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-destructive/20 border border-destructive text-destructive-foreground px-4 py-3 rounded mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}
        
        {statusMessage && (
          <div className={`${
            statusMessage.startsWith('Error:') 
              ? 'bg-destructive/20 border-destructive text-destructive-foreground' 
              : 'bg-primary/20 border-primary text-primary-foreground'
            } px-4 py-3 rounded mb-4 border`} 
            role="alert"
          >
            <p>{statusMessage}</p>
            <Button 
              variant="ghost" 
              className="h-auto p-0 float-right text-sm" 
              onClick={() => setStatusMessage(null)}
            >
              ✕
            </Button>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-card text-card-foreground">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 px-4 text-left">Student Number</th>
                <th className="py-2 px-4 text-left">Name</th>
                <th className="py-2 px-4 text-left">CPR Number</th>
                <th className="py-2 px-4 text-left">Status</th>
                <th className="py-2 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 px-4 text-center text-muted-foreground">No students found.</td>
                </tr>
              ) : (
                students.map(student => (
                  <tr key={student.id} className="hover:bg-muted/50 border-b border-border">
                    <td className="py-2 px-4">{student.studentNumber}</td>
                    <td className="py-2 px-4">{student.name.value}</td>
                    <td className="py-2 px-4">{student.cprNumber.value}</td>
                    <td className="py-2 px-4">
                      {student.finishedDate ? (
                        <span className="inline-block bg-muted text-muted-foreground py-1 px-2 rounded text-xs">Graduated</span>
                      ) : (
                        <span className="inline-block bg-primary/20 text-primary py-1 px-2 rounded text-xs">Active</span>
                      )}
                    </td>
                    <td className="py-2 px-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="mr-2"
                        onClick={() => handleEditStudent(student.id)}
                        disabled={processingAction}
                      >
                        Rediger
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mr-2"
                        onClick={() => handleDeleteStudent(student.id)}
                        disabled={processingAction}
                      >
                        Slet
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>

      {/* Student Dialog */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modalMode === 'create' ? 'Add New Student' : 'Edit Student'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="studentNumber">
                  Student Number
                </Label>
                <Input
                  id="studentNumber"
                  name="studentNumber"
                  value={studentData.studentNumber}
                  onChange={handleInputChange}
                  className={
                    validationErrors.studentNumber ? 'border-destructive' : ''
                  }
                  disabled={processingAction}
                />
                {validationErrors.studentNumber && (
                  <p className="text-destructive text-xs mt-1">{validationErrors.studentNumber[0]}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="name">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={studentData.name.value}
                  onChange={handleInputChange}
                  className={
                    validationErrors['name.value'] ? 'border-destructive' : ''
                  }
                  disabled={processingAction}
                />
                {validationErrors['name.value'] && (
                  <p className="text-destructive text-xs mt-1">{validationErrors['name.value'][0]}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="cprNumber">
                  CPR Number
                </Label>
                <Input
                  id="cprNumber"
                  name="cprNumber"
                  value={studentData.cprNumber.value}
                  onChange={handleInputChange}
                  className={
                    validationErrors['cprNumber.value'] ? 'border-destructive' : ''
                  }
                  disabled={processingAction}
                />
                {validationErrors['cprNumber.value'] && (
                  <p className="text-destructive text-xs mt-1">{validationErrors['cprNumber.value'][0]}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="educationId">
                  Education
                </Label>
                <select
                  id="educationId"
                  name="educationId"
                  value={studentData.educationId}
                  onChange={handleInputChange}
                  className={
                    validationErrors.educationId ? 'border-destructive' : ''
                  }
                  disabled={processingAction}
                >
                  <option value="">Select Education</option>
                  <option value="3d909e91-fa43-4e0e-ab16-39d31e6d82ea">Computer Science</option>
                  <option value="f470a059-8954-438a-a75a-5e24d93d3c7a">Mathematics</option>
                  <option value="c9146a9c-bcc6-43ab-8dc8-6e1e02ec4696">Physics</option>
                  <option value="2aa0f8d0-ed88-4a21-b3bc-7de98f04a21c">Biology</option>
                </select>
                {validationErrors.educationId && (
                  <p className="text-destructive text-xs mt-1">{validationErrors.educationId[0]}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="startPeriodId">
                  Start Period
                </Label>
                <select
                  id="startPeriodId"
                  name="startPeriodId"
                  value={studentData.startPeriodId}
                  onChange={handleInputChange}
                  className={
                    validationErrors.startPeriodId ? 'border-destructive' : ''
                  }
                  disabled={processingAction}
                >
                  <option value="">Select Start Period</option>
                  <option value="46f22f68-4899-4ea9-85ba-3ef22ad24cdf">Fall 2023</option>
                  <option value="a91dbbc5-a01e-47fa-8106-b3ddfa718ba1">Spring 2024</option>
                </select>
                {validationErrors.startPeriodId && (
                  <p className="text-destructive text-xs mt-1">{validationErrors.startPeriodId[0]}</p>
                )}
              </div>
              
              {modalMode === 'edit' && (
                <div className="grid gap-2">
                  <Label htmlFor="finishedDate">
                    Graduation Date (optional)
                  </Label>
                  <Input
                    type="date"
                    id="finishedDate"
                    name="finishedDate"
                    value={studentData.finishedDate ? new Date(studentData.finishedDate).toISOString().split('T')[0] : ''}
                    onChange={handleInputChange}
                    disabled={processingAction}
                  />
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
                disabled={processingAction}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={processingAction}
              >
                {processingAction ? 'Processing...' : modalMode === 'create' ? 'Create' : 'Update'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}