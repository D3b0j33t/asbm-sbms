
import { faker } from '@faker-js/faker';

// Student type
export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  rollNumber: string;
  course: string;
  semester: number;
  attendance: number;
  behaviorScore: number;
  academicScore: number;
  participationScore: number;
  avatar?: string;
  enrollmentDate: Date;
  behavioralIncidents: BehavioralIncident[];
}

// Behavioral incident type
export interface BehavioralIncident {
  id: string;
  type: string;
  description: string;
  date: Date;
  severity: string;
}

// Available courses
export const availableCourses = [
  { id: 'bca', name: 'BCA - Bachelor of Computer Applications' },
  { id: 'bba', name: 'BBA - Bachelor of Business Administration' },
  { id: 'mba', name: 'MBA - Master of Business Administration' },
  { id: 'ba-english', name: 'BA-English - Bachelor of Arts in English' },
  { id: 'bcom', name: 'BCom - Bachelor of Commerce' },
  { id: 'bsc-cs', name: 'BSc-CS - Bachelor of Science in Computer Science' },
  { id: 'btech', name: 'BTech - Bachelor of Technology' },
  { id: 'mca', name: 'MCA - Master of Computer Applications' }
];

// Generate a mock student
const generateStudent = (courseId: string, index: number): Student => {
  const course = availableCourses.find(c => c.id === courseId)?.name || 'Unknown Course';
  const coursePrefix = courseId.toUpperCase();
  
  // Generate behavioral incidents (0-3 per student)
  const incidents: BehavioralIncident[] = [];
  const incidentCount = faker.number.int({ min: 0, max: 3 });
  
  for (let i = 0; i < incidentCount; i++) {
    incidents.push({
      id: faker.string.uuid(),
      type: faker.helpers.arrayElement(['Minor', 'Major', 'Critical']),
      description: faker.lorem.sentence(),
      date: faker.date.recent({ days: 90 }),
      severity: faker.helpers.arrayElement(['Low', 'Medium', 'High'])
    });
  }
  
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    rollNumber: `${coursePrefix}-${new Date().getFullYear().toString().substring(2)}-${String(index + 1).padStart(3, '0')}`,
    course,
    semester: faker.number.int({ min: 1, max: 8 }),
    attendance: faker.number.int({ min: 60, max: 100 }),
    behaviorScore: faker.number.int({ min: 60, max: 100 }),
    academicScore: faker.number.int({ min: 60, max: 100 }),
    participationScore: faker.number.int({ min: 60, max: 100 }),
    avatar: faker.image.avatar(),
    enrollmentDate: faker.date.past({ years: 3 }),
    behavioralIncidents: incidents
  };
};

// Generate students for each course
export const generateStudentDatabase = (): Student[] => {
  const students: Student[] = [];
  
  availableCourses.forEach(course => {
    // Generate 50 students for each course
    for (let i = 0; i < 50; i++) {
      students.push(generateStudent(course.id, i));
    }
  });
  
  return students;
};

// Export the database
export const studentDatabase = generateStudentDatabase();

// Helper functions to get students by course
export const getStudentsByCourse = (courseId: string): Student[] => {
  const courseName = availableCourses.find(c => c.id === courseId)?.name;
  return studentDatabase.filter(student => student.course === courseName);
};

// Get a student by ID
export const getStudentById = (id: string): Student | undefined => {
  return studentDatabase.find(student => student.id === id);
};

// Get a random student
export const getRandomStudent = (): Student => {
  return faker.helpers.arrayElement(studentDatabase);
};
