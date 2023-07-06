import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { UserRecord } from '../records/user.record';
import { HrRecord } from '../records/hr.record';
import { sendMail } from '../utils/sendMail';
import { pool } from '../config/db';
import { ValidationError } from '../utils/errors';
import { StudentRecord } from '../records/student.record';

export const adminRouter = Router();
// zalogowany admin
adminRouter
    .post('/add-hr/',async (req,res) =>{

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

        await sendMail(email,'MegaK Head hunter - rejestracja','jakś wiadomośc z linkiem aktywacyjnym  http://adres.pl/aktywacja/TOKEN'); //TODO Dodanie generowanie tokenu,  dodanie tekstu maila
        res.status(200).json({ success: true, message: 'userHRAdded' });

    })
    .get('/employed-students', async (req, res) => {

        const data = await StudentRecord.employedStudents();
        res.json(data);
    })
