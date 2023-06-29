import { pool } from '../config/db';
import { ValidationError } from './errors';
import { userState } from '../types/user/user.enum';

export const hrExists = async (userId:string) =>{

    const result = await pool('users')
        .select('userId')
        .where({ userId })
        .where('userState', userState.hr)
        .first();
    if(result === undefined){
        throw new ValidationError('unAuthorized')
    }
}