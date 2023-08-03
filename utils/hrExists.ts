import { pool } from '../config/db';
import { ValidationError } from './errors';
import { UserState } from '../types';

export const hrExists = async (userId:string) =>{

    const result = await pool('users')
        .select('userId')
        .where({ userId })
        .where('userState', UserState.hr)
        .first();

    if(result === undefined){
        throw new ValidationError('unAuthorized')
    }
}