import { Employed, Pagination } from '../types';
import { pool } from '../config/db';
import { ValidationError } from './errors';

export const employedStudents = async (pagination: Pagination): Promise<Employed[]> =>  {

    const result = pool('students')
        .select(
            'students.studentId',
            'students.firstName',
            'students.lastName',
            'students.githubUsername',
            'students.reservedBy',
            'hrs.fullName',
            'hrs.company'
        )
        .where('userStatus',4)
        .where('users.userState',4)
        .join('users', 'students.studentId', '=', 'users.userId')
        .join('hrs', 'students.reservedBy', '=', 'hrs.hrId')
        .limit(Number(pagination.rowsPerPage))
        .offset(Number(pagination.page));

    if(result !== undefined)
        return result;
    else
        throw new ValidationError('noStudentsMessage');
}

export const employedStudentsCount = async (): Promise<number> => {
    const result = await pool('students')
        .count('* as totalCount')
        .where('userStatus',4)
        .where('users.userState',4)
        .join('users', 'students.studentId', '=', 'users.userId')
        .first() as { totalCount:number };

    if(result !== undefined)
        return result.totalCount;
    else
        throw new ValidationError('noStudentsMessage');
}