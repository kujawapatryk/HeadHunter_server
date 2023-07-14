import { UserState } from '../types';
import { pool } from '../config/db';

type StudentResult = {
    firstName: string,
    lastName: string,
    githubUsername:string;
}

type HrResult = {
    fullName: string,
}

export const extraLoginData = async (id:string, state: number) => {

    if(state === UserState.student){
        const result = await pool('students')
            .select(
                'firstName',
                'lastName',
                'githubUsername'
            )
            .where('studentId',id)
            .first() as StudentResult;

        return {
            name: result.firstName + '' + result.lastName,
            githubUsername: result.githubUsername,
        };

    }else if(state === UserState.hr){
        const result = await pool('hrs')
            .select('fullName')
            .where('hrId',id)
            .first() as HrResult;

        return { name: result.fullName };

    }else if(state === UserState.admin){
        return { name: 'Administrator' };
    }
}