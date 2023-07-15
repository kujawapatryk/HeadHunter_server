import { Request, Response, Router } from 'express';
import { v4 as uuid } from 'uuid';
import { UserRecord } from '../records/user.record';
import { HrRecord } from '../records/hr.record';
import { sendMail } from '../utils/sendMail';
import { pool } from '../config/db';
import { ValidationError } from '../utils/errors';
import { employedStudents, employedStudentsCount, restoreStudent } from '../utils/employedStudents';
import { auth } from '../auth/auth';
import { UserState } from '../types';

export const adminRouter = Router();
// zalogowany admin
adminRouter
    .post('/add-hr/', auth([UserState.admin]), async (req, res) =>{

        const { email,fullName,company,maxReservedStudents } = req.body;

        const result = await pool('users')
            .select('userId')
            .where({ email })
            .first();

        if(result !== undefined) throw new ValidationError('emailExists');
        const userId = uuid();
        const userData = {
            userId,
            email,
        };
        const hrData = {
            hrId: userId,
            fullName,
            company,
            maxReservedStudents: Number(maxReservedStudents),
        };
        const addUser = new UserRecord(userData);
        const addHr = new HrRecord(hrData);

        await addUser.insert();
        await addHr.insert();

        await sendMail(email,'MegaK Head hunter - rejestracja','jakś wiadomośc z linkiem aktywacyjnym  https://adres.pl/aktywacja/TOKEN'); //TODO Dodanie generowanie tokenu,  dodanie tekstu maila
        res.status(200).json({ success: true, message: 'userHRAdded' });

    })
    .get('/employed-students', auth([UserState.admin]) ,async (req:Request, res:Response) => {

        const query = {
            page: Number(req.query.page),
            rowsPerPage: Number(req.query.rowsPerPage),
        };

        const student = await employedStudents(query);
        const totalCount = await employedStudentsCount();
        const data = {
            student,
            totalCount,
        };

        res
            .cookie('xxxxxx','xxawqa')
            .json(data);
    })
    .get('/restore-student/:studentId', async (req, res) => {
        const { studentId } = req.params;
        const result = await restoreStudent(studentId);

        res.json(result);
    })
