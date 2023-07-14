import { Router } from 'express';
import { HrRecord } from '../records/hr.record';
import { verifyCookie } from '../auth/auth';
import { UserEntity, UserState } from '../types';

export const hrRouter = Router();

hrRouter

    .get('/name', verifyCookie([UserState.hr]), async (req, res) => {
        const { userId } = req.user  as UserEntity;
        const { fullName } = (await HrRecord.getName(userId));
        res.json(fullName);
    })