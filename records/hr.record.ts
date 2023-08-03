import { HrEntity } from '../types';
import { ValidationError } from '../utils/errors';
import { pool } from '../config/db';

type HrResult = { fullName:string };

export class HrRecord implements HrEntity {
    hrId: string;
    fullName: string;
    company: string;
    maxReservedStudents: number;

    constructor(obj: HrEntity) {
    
        if (!obj.fullName) {
            throw new ValidationError('nameRequired');
        }
        if (!obj.company) {
            throw new ValidationError('organizationNameRequired');
        }
        if (obj.maxReservedStudents < 1 || obj.maxReservedStudents > 999) {
            throw new ValidationError('hrLimit');
        }

        this.hrId = obj.hrId;
        this.fullName = obj.fullName;
        this.company = obj.company;
        this.maxReservedStudents = obj.maxReservedStudents;
    }

    async insert():Promise<void>{
        await pool('hrs')
            .insert({
                hrId: this.hrId,
                fullName: this.fullName,
                company: this.company,
                maxReservedStudents: this.maxReservedStudents,
            }).catch(() => {
                throw new ValidationError('userAddFailed')
            });

    }

    static async getName(hrId:string): Promise<HrResult> {
        const results = await pool('hrs')
            .select('fullName')
            .where({ hrId })
            .first() as HrResult ;

        return results;
    }

}