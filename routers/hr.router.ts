import { Router } from 'express';
import { HrRecord } from '../records/hr.record';
import { auth } from '../auth/auth';
import { UserEntity, UserState } from '../types';

export const hrRouter = Router();

hrRouter

    .get('/name', auth([UserState.hr]), async (req, res) => {
        const { userId } = req.user  as UserEntity;
        const { fullName } = (await HrRecord.getName(userId));
        res.json(fullName);
    })