import { pool } from '../config/db';
import {
    AvailableStudent,
    expectedContractType,
    expectedTypeWork,
    FilterQuery,
    Internship,
    StudentStatus
} from '../types';

export class StudentFilter implements FilterQuery{
    remoteWork: boolean;
    inOffice: boolean;
    employmentContract: boolean|string;
    b2b: boolean|string;
    mandateContract: boolean|string;
    workContract: boolean|string;
    min: string|number;
    max: string|number;
    canTakeApprenticeship: boolean|null|string;
    monthsOfCommercialExp: string|null;
    courseCompletion: string|number;
    courseEngagement: string|number;
    projectDegree: string|number;
    teamProjectDegree: string|number;
    page: string|number;
    rowsPerPage : string|number;
    hrId: string;
    action:string;

    constructor(obj:FilterQuery) {
        //@TODO data validation can be added
        this.remoteWork = obj.remoteWork;
        this.inOffice = obj.inOffice;
        this.employmentContract = obj.employmentContract;
        this.b2b = obj.b2b;
        this.mandateContract = obj.mandateContract;
        this.workContract = obj.workContract;
        this.min = obj.min;
        this.max = obj.max;
        this.canTakeApprenticeship = obj.canTakeApprenticeship;
        this.monthsOfCommercialExp = obj.monthsOfCommercialExp;
        this.courseCompletion = obj.courseCompletion;
        this.courseEngagement = obj.courseEngagement;
        this.projectDegree = obj.projectDegree;
        this.teamProjectDegree = obj.teamProjectDegree;
        this.page = obj.page;
        this.rowsPerPage = obj.rowsPerPage;
        this.hrId=obj.hrId;
        this.action = obj.action;
    }

    expectedTypeWork() {
        if (this.remoteWork || this.inOffice )
            return [
                (this.remoteWork ? expectedTypeWork.remoteWork : expectedTypeWork.none),
                (this.inOffice ? expectedTypeWork.inOffice : expectedTypeWork.none)
            ]
        else
            return [
                expectedTypeWork.remoteWork,
                expectedTypeWork.inOffice
            ]
    }

    expectedContractType(){
        if(this.employmentContract || this.b2b || this.mandateContract || this.workContract){
            return [
                this.employmentContract ? expectedContractType.employmentContract : expectedContractType.none,
                this.b2b ? expectedContractType.b2b : expectedContractType.none,
                this.mandateContract ? expectedContractType.mandateContract : expectedContractType.none,
                this.workContract ? expectedContractType.workContract : expectedContractType.none
            ]
        }else{
            return [
                expectedContractType.employmentContract,
                expectedContractType.b2b,
                expectedContractType.mandateContract,
                expectedContractType.workContract
            ]
        }
    }

    apprenticeship(){
        if(this.canTakeApprenticeship === null){
            return [Internship.Nie, Internship.Tak]
        }else{
            return [this.canTakeApprenticeship ? Internship.Tak : Internship.Nie]
        }
    }

    change(){
        this.page = Number(this.page);
        this.rowsPerPage = Number(this.rowsPerPage);
        this.page = this.page * this.rowsPerPage;

        const selectAll= [
            'studentId',
            'firstName',
            'lastName',
            'courseCompletion',
            'courseEngagement',
            'projectDegree',
            'teamProjectDegree',
            'expectedTypeWork',
            'targetWorkCity',
            'expectedContractType',
            'expectedSalary',
            'canTakeApprenticeship',
            'monthsOfCommercialExp'
        ];

        const selectReserved =[
            'studentId',
            'firstName',
            'lastName',
            'courseCompletion',
            'courseEngagement',
            'projectDegree',
            'teamProjectDegree',
            'expectedTypeWork',
            'targetWorkCity',
            'expectedContractType',
            'expectedSalary',
            'canTakeApprenticeship',
            'monthsOfCommercialExp',
            'githubUsername',
            'reservationExpiresOn'
        ];

        if(this.action === 'all')
            return{
                select: selectAll,
                userStatus: StudentStatus.active,
                reservedBy: null,
            }
        else if(this.action === 'reserved')
        {
            return{
                select: selectReserved,
                userStatus: StudentStatus.reserved,
                reservedBy: this.hrId,
            }
        }

    }

    async getStudents():Promise<AvailableStudent[] | null>{
        const { select,userStatus,reservedBy } = this.change();
        const results = await pool('students')
            .select(select)
            .whereIn('expectedTypeWork', this.expectedTypeWork() )
            .whereIn('expectedContractType', this.expectedContractType())
            .whereIn('canTakeApprenticeship', this.apprenticeship())
            .whereBetween('expectedSalary',[this.min,this.max])
            .where('monthsOfCommercialExp', '>=', this.monthsOfCommercialExp)
            .where('courseCompletion', '>=', this.courseCompletion)
            .where('courseEngagement', '>=', this.courseEngagement)
            .where('projectDegree', '>=', this.projectDegree)
            .where('teamProjectDegree', '>=', this.teamProjectDegree)
            .where('userStatus', userStatus)
            .where('reservedBy', reservedBy)
            .limit(Number(this.rowsPerPage))
            .offset(Number(this.page)) as AvailableStudent[];

        return results.length === 0 ? null : results;
    }

    async allRecordsStudent():Promise<number>{

        const { userStatus,reservedBy } = this.change();
        const results = await pool('students')
            .count('* as totalCount')
            .whereIn('expectedTypeWork', this.expectedTypeWork() )
            .whereIn('expectedContractType', this.expectedTypeWork())
            .whereIn('canTakeApprenticeship', this.apprenticeship())
            .whereBetween('expectedSalary',[this.min,this.max])
            .where('monthsOfCommercialExp', '>=', this.monthsOfCommercialExp)
            .where('courseCompletion', '>=', this.courseCompletion)
            .where('courseEngagement', '>=', this.courseEngagement)
            .where('projectDegree', '>=', this.projectDegree)
            .where('teamProjectDegree', '>=', this.teamProjectDegree)
            .where('userStatus', userStatus)
            .where('reservedBy', reservedBy)
            .first() as { totalCount:number };

        return results.totalCount;
    }
   
}

// console.log(
//   'remoteWork:', this.remoteWork,
//   'inOffice:', this.inOffice,
//   'employmentContract:', this.employmentContract,
//   'b2b:', this.b2b,
//   'mandateContract:', this.mandateContract,
//   'workContract:', this.workContract,
//   'min:', this.min,
//   'max:', this.max,
//   'canTakeApprenticeship:', this.canTakeApprenticeship,
//   'monthsOfCommercialExp:', this.monthsOfCommercialExp,
//   'courseCompletion:', this.courseCompletion,
//   'courseEngagement:', this.courseEngagement,
//   'projectDegree:', this.projectDegree,
//   'teamProjectDegree:', this.teamProjectDegree,
//   'page:', this.page,
//   'rowsPerPage:', this.rowsPerPage
// );