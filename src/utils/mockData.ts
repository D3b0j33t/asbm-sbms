
// Mock Course data with required properties for UserCourse
export interface Course {
  id: string;
  name: string;
  instructor: string;
  description: string;
  progress: number;
  pendingAssignments: number;
  color: string;
  image?: string;
}

// Mock behavioral incident data
export interface BehavioralIncident {
  id: string;
  type: 'Minor' | 'Major';
  description: string;
  date?: Date;           // Make date optional
  incident_date?: string; // Add incident_date from database
  severity?: string;
  action?: string;
  teacher?: string;
  student_id?: string;   // Add student_id from database
  created_at?: string;   // Add created_at from database
}

// Mock student data
export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  attendance: number;
  behaviorScore: number;
  academicScore: number;
  participationScore: number;
  rollNumber: string;
  semester: number;
  avatar?: string;
  enrollmentDate?: Date;
  behavioralIncidents: BehavioralIncident[];
  personalityTraits: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  strengths: string[];
  areasOfImprovement: string[];
  counselorNotes?: string;
}

// Mock teacher data
export interface Teacher {
  id: string;
  name: string;
  email: string;
  department: string;
  subject: string;
  avatar?: string;
  phone?: string;
}

// Generate mock courses
export const mockCourses: Course[] = [
  {
    id: 'course1',
    name: 'Introduction to Computer Science',
    instructor: 'Prof. Smith',
    description: 'Foundational concepts of computer science and programming',
    progress: 75,
    pendingAssignments: 2,
    color: '#4285F4',
    image: '/lovable-uploads/course-cs.jpg'
  },
  {
    id: 'course2',
    name: 'Business Administration',
    instructor: 'Prof. Johnson',
    description: 'Principles of business management and administration',
    progress: 60,
    pendingAssignments: 1,
    color: '#0F9D58',
    image: '/lovable-uploads/course-ba.jpg'
  },
  {
    id: 'course3',
    name: 'Financial Accounting',
    instructor: 'Prof. Williams',
    description: 'Introduction to financial accounting principles',
    progress: 90,
    pendingAssignments: 0,
    color: '#DB4437',
    image: '/lovable-uploads/course-fa.jpg'
  },
  {
    id: 'course4',
    name: 'Data Structures and Algorithms',
    instructor: 'Prof. Taylor',
    description: 'Advanced data structures and algorithm design',
    progress: 50,
    pendingAssignments: 3,
    color: '#F4B400',
    image: '/lovable-uploads/course-dsa.jpg'
  },
  {
    id: 'course5',
    name: 'Marketing Principles',
    instructor: 'Prof. Brown',
    description: 'Fundamentals of marketing strategy and consumer behavior',
    progress: 85,
    pendingAssignments: 1,
    color: '#4285F4',
    image: '/lovable-uploads/course-mp.jpg'
  },
  {
    id: 'course6',
    name: 'Software Engineering',
    instructor: 'Prof. Anderson',
    description: 'Software development methodologies and practices',
    progress: 70,
    pendingAssignments: 2,
    color: '#0F9D58',
    image: '/lovable-uploads/course-se.jpg'
  }
];

// Generate mock students
export const mockStudents: Student[] = [
  {
    id: 'student1',
    name: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    phone: '555-123-4567',
    course: 'Introduction to Computer Science',
    attendance: 92,
    behaviorScore: 95,
    academicScore: 88,
    participationScore: 90,
    rollNumber: 'CS001',
    semester: 3,
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=AJ',
    behavioralIncidents: [],
    personalityTraits: {
      openness: 85,
      conscientiousness: 90,
      extraversion: 75,
      agreeableness: 88,
      neuroticism: 40
    },
    strengths: ['Communication', 'Problem Solving', 'Critical Thinking'],
    areasOfImprovement: ['Time Management'],
    counselorNotes: "Alice shows exceptional aptitude for programming concepts."
  },
  {
    id: 'student2',
    name: 'Bob Smith',
    email: 'bob.smith@example.com',
    phone: '555-765-4321',
    course: 'Business Administration',
    attendance: 78,
    behaviorScore: 65,
    academicScore: 72,
    participationScore: 68,
    rollNumber: 'BA002',
    semester: 4,
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=BS',
    behavioralIncidents: [
      {
        id: 'incident1',
        type: 'Minor',
        description: 'Late to class',
        date: new Date(2023, 3, 15),
        severity: 'Low',
        action: 'Verbal warning',
        teacher: 'Prof. Johnson'
      }
    ],
    personalityTraits: {
      openness: 60,
      conscientiousness: 55,
      extraversion: 85,
      agreeableness: 70,
      neuroticism: 65
    },
    strengths: ['Teamwork', 'Presentation'],
    areasOfImprovement: ['Organization', 'Meeting Deadlines'],
    counselorNotes: "Bob needs more structure and guidance with assignments."
  },
  {
    id: 'student3',
    name: 'Charlie Davis',
    email: 'charlie.davis@example.com',
    phone: '555-987-6543',
    course: 'Financial Accounting',
    attendance: 85,
    behaviorScore: 90,
    academicScore: 95,
    participationScore: 85,
    rollNumber: 'FA003',
    semester: 2,
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=CD',
    behavioralIncidents: [],
    personalityTraits: {
      openness: 70,
      conscientiousness: 80,
      extraversion: 60,
      agreeableness: 75,
      neuroticism: 50
    },
    strengths: ['Analytical Thinking', 'Problem Solving'],
    areasOfImprovement: ['Time Management'],
    counselorNotes: "Charlie is a strong student with a good understanding of financial concepts."
  },
  {
    id: 'student4',
    name: 'Diana Wilson',
    email: 'diana.wilson@example.com',
    phone: '555-456-7890',
    course: 'Data Structures and Algorithms',
    attendance: 65,
    behaviorScore: 60,
    academicScore: 78,
    participationScore: 70,
    rollNumber: 'DS004',
    semester: 5,
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=DW',
    behavioralIncidents: [
      {
        id: 'incident2',
        type: 'Major',
        description: 'Disruptive behavior in class',
        date: new Date(2023, 4, 10)
      },
      {
        id: 'incident3',
        type: 'Minor',
        description: 'Late assignment submission',
        date: new Date(2023, 4, 20)
      }
    ],
    personalityTraits: {
      openness: 80,
      conscientiousness: 70,
      extraversion: 70,
      agreeableness: 60,
      neuroticism: 55
    },
    strengths: ['Critical Thinking', 'Communication'],
    areasOfImprovement: ['Organization', 'Meeting Deadlines'],
    counselorNotes: "Diana needs more guidance on time management and organization."
  },
  {
    id: 'student5',
    name: 'Ethan Brown',
    email: 'ethan.brown@example.com',
    phone: '555-234-5678',
    course: 'Marketing Principles',
    attendance: 90,
    behaviorScore: 85,
    academicScore: 82,
    participationScore: 88,
    rollNumber: 'MP005',
    semester: 3,
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=EB',
    behavioralIncidents: [],
    personalityTraits: {
      openness: 75,
      conscientiousness: 85,
      extraversion: 65,
      agreeableness: 70,
      neuroticism: 50
    },
    strengths: ['Problem Solving', 'Critical Thinking'],
    areasOfImprovement: ['Time Management'],
    counselorNotes: "Ethan needs more guidance on time management and organization."
  },
  {
    id: 'student6',
    name: 'Fiona Miller',
    email: 'fiona.miller@example.com',
    phone: '555-876-5432',
    course: 'Software Engineering',
    attendance: 95,
    behaviorScore: 92,
    academicScore: 90,
    participationScore: 95,
    rollNumber: 'SE006',
    semester: 6,
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=FM',
    behavioralIncidents: [],
    personalityTraits: {
      openness: 80,
      conscientiousness: 70,
      extraversion: 70,
      agreeableness: 60,
      neuroticism: 55
    },
    strengths: ['Problem Solving', 'Critical Thinking'],
    areasOfImprovement: ['Time Management'],
    counselorNotes: "Fiona needs more guidance on time management and organization."
  },
  {
    id: 'student7',
    name: 'George Taylor',
    email: 'george.taylor@example.com',
    phone: '555-345-6789',
    course: 'Introduction to Computer Science',
    attendance: 70,
    behaviorScore: 68,
    academicScore: 75,
    participationScore: 65,
    rollNumber: 'CS007',
    semester: 1,
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=GT',
    behavioralIncidents: [
      {
        id: 'incident4',
        type: 'Minor',
        description: 'Using phone during class',
        date: new Date(2023, 3, 5)
      }
    ],
    personalityTraits: {
      openness: 65,
      conscientiousness: 70,
      extraversion: 60,
      agreeableness: 65,
      neuroticism: 50
    },
    strengths: ['Problem Solving', 'Critical Thinking'],
    areasOfImprovement: ['Time Management'],
    counselorNotes: "George needs more guidance on time management and organization."
  },
  {
    id: 'student8',
    name: 'Hannah Martin',
    email: 'hannah.martin@example.com',
    phone: '555-654-3210',
    course: 'Business Administration',
    attendance: 88,
    behaviorScore: 90,
    academicScore: 85,
    participationScore: 92,
    rollNumber: 'BA008',
    semester: 4,
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=HM',
    behavioralIncidents: [],
    personalityTraits: {
      openness: 70,
      conscientiousness: 80,
      extraversion: 70,
      agreeableness: 60,
      neuroticism: 55
    },
    strengths: ['Problem Solving', 'Critical Thinking'],
    areasOfImprovement: ['Time Management'],
    counselorNotes: "Hannah needs more guidance on time management and organization."
  },
  {
    id: 'student9',
    name: 'Ian Wilson',
    email: 'ian.wilson@example.com',
    phone: '555-987-1234',
    course: 'Financial Accounting',
    attendance: 82,
    behaviorScore: 78,
    academicScore: 80,
    participationScore: 75,
    rollNumber: 'FA009',
    semester: 2,
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=IW',
    behavioralIncidents: [],
    personalityTraits: {
      openness: 65,
      conscientiousness: 70,
      extraversion: 60,
      agreeableness: 65,
      neuroticism: 50
    },
    strengths: ['Problem Solving', 'Critical Thinking'],
    areasOfImprovement: ['Time Management'],
    counselorNotes: "Ian needs more guidance on time management and organization."
  },
  {
    id: 'student10',
    name: 'Jessica Clark',
    email: 'jessica.clark@example.com',
    phone: '555-234-9876',
    course: 'Data Structures and Algorithms',
    attendance: 94,
    behaviorScore: 88,
    academicScore: 92,
    participationScore: 90,
    rollNumber: 'DS010',
    semester: 5,
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=JC',
    behavioralIncidents: [],
    personalityTraits: {
      openness: 70,
      conscientiousness: 80,
      extraversion: 70,
      agreeableness: 60,
      neuroticism: 55
    },
    strengths: ['Problem Solving', 'Critical Thinking'],
    areasOfImprovement: ['Time Management'],
    counselorNotes: "Jessica needs more guidance on time management and organization."
  }
];

// For each of the remaining students, ensure they have the required properties
mockStudents.forEach(student => {
  if (!student.personalityTraits) {
    student.personalityTraits = {
      openness: Math.floor(Math.random() * 30) + 60,
      conscientiousness: Math.floor(Math.random() * 30) + 60,
      extraversion: Math.floor(Math.random() * 30) + 60,
      agreeableness: Math.floor(Math.random() * 30) + 60,
      neuroticism: Math.floor(Math.random() * 50) + 30
    };
  }
  
  if (!student.strengths) {
    student.strengths = ['Communication', 'Problem Solving'];
  }
  
  if (!student.areasOfImprovement) {
    student.areasOfImprovement = ['Time Management', 'Focus'];
  }
  
  if (!student.counselorNotes) {
    student.counselorNotes = '';
  }
});

// Generate mock teachers
export const mockTeachers: Teacher[] = [
  {
    id: 'teacher1',
    name: 'Dr. James Wilson',
    email: 'james.wilson@example.com',
    department: 'Computer Science',
    subject: 'Data Structures',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=JW'
  },
  {
    id: 'teacher2',
    name: 'Prof. Sarah Miller',
    email: 'sarah.miller@example.com',
    department: 'Business Studies',
    subject: 'Marketing Principles',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=SM'
  },
  {
    id: 'teacher3',
    name: 'Dr. Michael Brown',
    email: 'michael.brown@example.com',
    department: 'Engineering',
    subject: 'Software Engineering',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=MB'
  },
  {
    id: 'teacher4',
    name: 'Prof. Elizabeth Taylor',
    email: 'elizabeth.taylor@example.com',
    department: 'Arts and Humanities',
    subject: 'English Literature',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=ET'
  },
  {
    id: 'teacher5',
    name: 'Dr. Robert Davis',
    email: 'robert.davis@example.com',
    department: 'Finance',
    subject: 'Financial Accounting',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=RD'
  },
  {
    id: 'teacher6',
    name: 'Prof. Jennifer Clark',
    email: 'jennifer.clark@example.com',
    department: 'Computer Science',
    subject: 'Introduction to Programming',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=JC'
  },
  {
    id: 'teacher7',
    name: 'Dr. Thomas White',
    email: 'thomas.white@example.com',
    department: 'Mathematics',
    subject: 'Calculus',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=TW'
  },
  {
    id: 'teacher8',
    name: 'Prof. Mary Johnson',
    email: 'mary.johnson@example.com',
    department: 'Psychology',
    subject: 'Introduction to Psychology',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=MJ'
  }
];
