import { Request, Response, Router } from 'express';
import { UserRecord } from '../records/user.record';
import { createToken, generateToken } from '../auth/token';
import { extraLoginData } from '../utils/extraLoginData';
import { ValidationError } from '../utils/errors';
import { auth } from '../auth/auth';
import { UserEntity, UserState } from '../types';
import { pool } from '../config/db';

export const authRouter = Router();

// representation of path accessible only for logged-in users
authRouter

    .post('/login', async (req: Request, res: Response) => {
        const params = new UserRecord(req.body);
        const result = await params.checkPassword();
        console.log(params)
        if (result.id) {

            const token = createToken(await generateToken(result.id))
            const extraData = await extraLoginData(result.id,result.state)

            res.cookie('token', token,{
                secure: false,
                domain: '127.0.0.1',
                httpOnly: true,
            })
                .json({
                    token,
                    ...result,
                    ...extraData,
                });

        } else {
            throw new ValidationError('Błędne hasło')
        }

    })

    .get('/logout', auth([UserState.admin, UserState.hr, UserState.student]), async (req,res) => {
        const { userId } = req.user as UserEntity;
        pool('user')
            .update('authToken', null)
            .where({ userId })

        res.clearCookie('token',{
            secure: false,
            domain: '127.0.0.1',
            httpOnly: true,
        })
            .json({ status: 'ok', message: 'logout' })

    })

    .get('/extra-login-data', auth([UserState.admin, UserState.hr, UserState.student]), async (req,res) => {
        const { userId, userState } = req.user as UserEntity;
        const data = {
            state: userState,
            ...await extraLoginData(userId, userState)
        }
        res.json(data);
    })