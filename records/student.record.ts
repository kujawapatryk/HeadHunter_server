import {FieldPacket} from "mysql2";
import {ValidationError} from "../utils/errors";
import {StudentEntity} from "../types/student";
import {Octokit} from "octokit";
import {pool} from "../config/db-sample";

const checkGitHub = async (userName: string): Promise<string | null> => {
  try {
    const octokit = new Octokit({});
    const userName = await octokit.request('GET /users/{username}', {
      username: userName,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })
    return userName.data.login;
  } catch (e) {
    return null;
  }
}

const checkGithubUsername = async (ghUserName: string): Promise<string | null> => {
  const [results] = (await pool.execute("SELECT `studentId` FROM `students` WHERE `githubUsername` = :ghUsername", {
    ghUserName,
  })) as StudentRecordResult;
  return results.length === 0 ? null : results[0].studentId;
}

type StudentRecordResult = [StudentEntity[], FieldPacket[]];

export class StudentRecord implements StudentEntity {

  studentId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  githubUsername: string;
  portfolioUrls: string | null;
  projectUrls: string;
  bio: string | null;
  expectedTypeWork: number;
  targetWorkCity: string;
  expectedContractType: number;
  expectedSalary: number;
  canTakeApprenticeship:number;
  monthsOfCommercialExp: number;
  education:string | null;
  workExperience:string | null;
  courses:	string | null;
  userStatus: string;
  courseCompletion: number;
  courseEngagment: number;
  projectDegree: number;
  teamProjectDegree: number;
  bonusProjectUrls:string | null;
  reservedBy:string | null;
  reservationExpiresOn: Date;

  constructor(obj:StudentEntity) {

    if (!obj.firstName) {
      throw new ValidationError("Musisz podać imię");
    }

    if (!obj.lastName) {
      throw new ValidationError("Musisz podać nazwisko");
    }

    if (checkGitHub(this.githubUsername) === null) {
      throw new ValidationError("Nie ma takiego konta GitHub");
    }

    if (checkGithubUsername(this.githubUsername) !== null) {
      throw new ValidationError("Taki użytkownik GitHuba już istnieje");
    }

    const phoneRegex = /(?:(?:(?:\+|00)?48)|(?:\(\+?48\)))?(?:1[2-8]|2[2-69]|3[2-49]|4[1-8]|5[0-9]|6[0-35-9]|[7-8][1-9]|9[145])\d{7}/
    if (!phoneRegex.test(this.phoneNumber) && this.phoneNumber !== '') {
      throw new ValidationError('Podaj poprawny numer polskiego telefonu lub Nie podawaj żadnego');
    }
    if (this.monthsOfCommercialExp < 0) {
      throw new ValidationError("Długość doświadczenia muli być liczbą nieujemną")
    }

    this.studentId = obj.studentId;
    this.firstName = obj.firstName;
    this.lastName = obj.lastName;
    this.phoneNumber = obj.phoneNumber;
    this.githubUsername = obj.githubUsername;
    this.portfolioUrls = obj.portfolioUrls;
    this.projectUrls = obj.projectUrls;
    this.bio = obj.bio;
    this.expectedTypeWork = obj.expectedTypeWork;
    this.targetWorkCity = obj.targetWorkCity;
    this.expectedContractType = obj.expectedContractType;
    this.expectedSalary = obj.expectedSalary;
    this.canTakeApprenticeship = obj.canTakeApprenticeship;
    this.monthsOfCommercialExp = obj.monthsOfCommercialExp;
    this.education = obj.education;
    this.workExperience = obj.workExperience;
    this.courses = obj.courses;
    this.userStatus = obj.userStatus;
    this.courseCompletion = obj.courseCompletion;
    this.courseEngagment = obj.courseEngagment;
    this.projectDegree = obj.projectDegree;
    this.teamProjectDegree = obj.teamProjectDegree;
    this.bonusProjectUrls = obj.bonusProjectUrls;
    this.reservedBy = obj.reservedBy;
    this.reservationExpiresOn = obj.reservationExpiresOn;
  }


}