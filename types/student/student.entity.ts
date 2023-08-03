export interface FilterStudent{
  courseCompletion: number;
  courseEngagement: number;
  teamProjectDegree: number;
  projectDegree: number;
  expectedTypeWork: number;
  expectedContractType: number;
  canTakeApprenticeship:boolean | number;
  expectedSalaryMin: number;
  expectedSalaryMax: number;
  monthsOfCommercialExp: number;
}

export interface AvailableStudent extends Omit<FilterStudent, 'expectedSalaryMin' | 'expectedSalaryMax'>{
  studentId: string;
  firstName: string;
  lastName: string;
  targetWorkCity: string;
  expectedSalary: number;
}

export interface ReservedStudent extends AvailableStudent {
  githubUsername:string;
  reservationExpiresOn: Date | null;
}

export interface StudentEntity extends ReservedStudent{
  phoneNumber: string;
  portfolioUrls: string;
  projectUrls:string;
  bio:string;
  education:string;
  workExperience:string;
  courses:	string;
  userStatus: string;
  bonusProjectUrls:string;
  reservedBy:string | null;
}

export interface SingleStudent extends Omit<StudentEntity, 'reservationExpiresOn' | 'reservedBy' | 'userStatus'> {
  email: string;
}
