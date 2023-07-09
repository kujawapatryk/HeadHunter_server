import { Employed, Pagination, StudentStatus, UserState  } from '../types';
import { pool } from '../config/db';
import { ValidationError } from './errors';

export const employedStudents = async (pagination: Pagination): Promise<Employed[]> => {

    const result = await pool('students')
        .select(
            'students.studentId',
            'students.firstName',
            'students.lastName',
            'students.githubUsername',
            'students.reservedBy',
            'hrs.fullName',
            'hrs.company'
        )
        .where('userStatus', StudentStatus.hired)
        .where('users.userState', UserState.hired)
        .join('users', 'students.studentId', '=', 'users.userId')
        .join('hrs', 'students.reservedBy', '=', 'hrs.hrId')
        .limit(Number(pagination.rowsPerPage))
        .offset(Number(pagination.page)) as Employed[];

    if(result.length !== 0)
        return result;
    else
        throw new ValidationError('noStudentsMessage');
}

export const employedStudentsCount = async (): Promise<number> => {
    const result = await pool('students')
        .count('* as totalCount')
        .where('userStatus', StudentStatus.hired)
        .where('users.userState', UserState.hired)
        .join('users', 'students.studentId', '=', 'users.userId')
        .first() as { totalCount:number };

    return result.totalCount;

}

export const restoreStudent = async (studentId: string)  => {

    await pool.transaction(async (trx) => {
        await trx('students')
            .update({
                userStatus: StudentStatus.active,
                reservedBy: null,
                reservationExpiresOn: null,
            })
            .where({ studentId });

        await trx('users')
            .update({
                userState: UserState.student,
            })
            .where({ userId: studentId });
    }).catch(() => {
        throw new ValidationError('tryLater')
    })
    return { message: 'restoreStudent' };
}