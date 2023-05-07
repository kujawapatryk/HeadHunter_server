import {FieldPacket} from "mysql2";
import {ValidationError} from "../utils/errors";
import {Octokit} from "octokit";
import {pool} from "../config/db-sample";
import {StudentEntity} from "../types";

const checkGitHub = async (userName: string): Promise<string | null> => {
  try {
    const resUserName = await new Octokit({}).request('GET /users/{username}', {
      username: userName,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })
    return resUserName.data.login;
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
  portfolioUrls: string[] | null;
  projectUrls: string[];
  bio: string | null;
  expectedTypeWork: number;
  targetWorkCity: string;
  expectedContractType: number;
  expectedSalary: number;
  canTakeApprenticeship: boolean;
  monthsOfCommercialExp: number;
  education: string | null;
  workExperience: string | null;
  courses: string | null;
  userStatus: string;
  courseCompletion: number;
  courseEngagement: number;
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

    const phoneRegex = /^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/
    if (!phoneRegex.test(this.phoneNumber) && this.phoneNumber !== '') {
      throw new ValidationError('Podaj poprawny numer telefonu lub nie podawaj żadnego');
    }

    if (this.monthsOfCommercialExp < 0) {
      throw new ValidationError("Długość doświadczenia musi być liczbą nieujemną")
    }

    if (isNaN(this.expectedSalary)) {
      throw new ValidationError("Oczekiwana wysokość pensji musi być liczbą")
    }

    if (this.courseCompletion < 0 || this.courseCompletion > 5){
      throw new ValidationError("Ocena musi być w zakresie 0-5")
    }

    if (this.courseEngagement < 0 || this.courseEngagement > 5){
      throw new ValidationError("Ocena musi być w zakresie 0-5")
    }

    if (this.projectDegree < 0 || this.projectDegree > 5){
      throw new ValidationError("Ocena musi być w zakresie 0-5")
    }

    if (this.teamProjectDegree < 0 || this.teamProjectDegree > 5){
      throw new ValidationError("Ocena musi być w zakresie 0-5")
    }

    if (this.expectedTypeWork < 1 || this.expectedTypeWork > 5){
      throw new ValidationError("Typ pracy musi być w zakresie 1-5")
    }

    if (this.expectedContractType < 1 || this.expectedContractType > 4){
      throw new ValidationError("Typ kontraktu musi być w zakresie 1-4")
    }

    this.portfolioUrls.forEach(el => {
      if (!/^(ftp|http|https):\/\/[^ "]+$/.test(el)) {
        throw new ValidationError("To nie jest link do portfolio")
      }
    })

    this.projectUrls.forEach(el => {
      if (!/^(http(s?):\/\/)?(www\.)?github\.([a-z])+\/([A-Za-z0-9]{1,})+\/?$/.test(el)) {
        throw new ValidationError("To nie jest link do projektu w GitHub")
      }
    })

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
    this.courseEngagement = obj.courseEngagement;
    this.projectDegree = obj.projectDegree;
    this.teamProjectDegree = obj.teamProjectDegree;
    this.bonusProjectUrls = obj.bonusProjectUrls;
    this.reservedBy = obj.reservedBy;
    this.reservationExpiresOn = obj.reservationExpiresOn;
  }

  static async studentShortInfo(id:string): Promise<StudentRecord[]> {
    const [results] = await pool.execute("SELECT `email`, `courseCompletion`, `courseEngagement`, `projectDegree`,`teamProjectDegree`,`expectedTypeWork`,`targetWorkCity`,`expectedContractType`,`expectedSalary`,`canTakeApprenticeship`,`monthsOfCommercialExp` FROM `students` WHERE `studentId` = :id",{
        id
    }) as StudentRecordResult;
    return results;
  }

  static async reservedChange(action:string,studentId:string, hrId?:string) {

    let userStatus;
    let reservationExpiresOn;

    if (action === 'reserve') {
      reservationExpiresOn =new Date();
      userStatus = 'reserved'
    } else if (action === 'employ') {
      reservationExpiresOn = null;
      userStatus ='hired';
      hrId = '';
    } else if (action === 'disinterest'){
      reservationExpiresOn = null;
      userStatus ='active';
      hrId = '';
    }
    else{
      throw new ValidationError('Nie udało się wykonać zmiany statusu')
    }
    await pool.execute("UPDATE `students' SET reservedBy = :hrId, userStatus = :userStatus, reservationExpiresOn = :reservationExpiresOn  WHERE studentId = :studentId",{hrId, userStatus, reservationExpiresOn, studentId})




  }
}