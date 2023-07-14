import { Request, Response, Router } from 'express';
import { UserRecord } from '../records/user.record';
import { ValidationError } from '../utils/errors';
import { comparePassword } from '../utils/validation/comparePassword';
import { createToken, generateToken } from '../auth/token';
import { verifyCookie } from '../auth/auth';
import { UserEntity, UserState } from '../types';
import { extraLoginData } from '../utils/extraLoginData';

export const userRouter = Router();

userRouter

    .post('/login', async (req: Request, res: Response) => {
        const params = new UserRecord(req.body);
        const result = await params.checkPassword();
        console.log(result)

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

// })
// .post('/refresh', async (req, res) => {
//     // refresh jwt
// })
//
// .delete('/logout', async (req, res) => {
//     // czyszczenie tokenów i wylogowanie
// })

    .post('/my-status', async (req, res) => {
        const { studentId, userStatus } = req.body;
        await UserRecord.updateStudentStatus(studentId, userStatus);
        res.json(true);
        // przyjmuje dane o statusie (zatrudniony lub nie)  i  wprowadza zmiany w bazie
    })
    //
    // .get('/token/:token', async (req: Request, res: Response) => {
    //     const userId: string | null = await UserRecord.checkToken(req.params.token);
    //     res.json(userId);
    // })

    .get('/check-token/:userId/:token', async (req, res) => {
        const { userId,token } = req.params;
        await UserRecord.checkToken(token, userId);
        res.status(200).json({ status: 'ok' });
    })

    .get('/reset/:email', async (req,res) =>{
        const email = req.params.email;
        await UserRecord.resetPassword(email);
        res.json({ status: 'ok', message:'emailResetSent' }).status(200);
    })

// .get('/getemail/:id', async (req: Request, res: Response) => {
//     const userEmail: any = await UserRecord.getEmail(req.params.id);
//     res.json(userEmail);
// })
//
// .get('/email/:email', async (req: Request, res: Response) => {
//     const userId: string | null = await UserRecord.checkEmail(req.params.email);
//     if (userId === null) {
//         throw new ValidationError('Nie ma takiego adresu e-mail');
//     }
//     await UserRecord.addToken(userId);
//     res.json(req.params.email);
// })
    .patch('/new-password', verifyCookie([UserState.admin, UserState.hr, UserState.student]), async (req,res) =>{
        const { token, password, confirmedPassword } = req.body;
        const { userId } = req.user  as UserEntity;
        await UserRecord.checkToken(token, userId);

        comparePassword(password,confirmedPassword);

        const user = new UserRecord({ userId,password });
        await user.updatePassword();
        await user.deleteToken();
        res.json({ message: 'passwordSuccessfullyChanged' }).status(200);

    })

    .patch('/changemail', verifyCookie([UserState.admin, UserState.hr, UserState.student]), async (req: Request, res: Response) => {
        const { email } = req.body;
        const { userId } = req.user  as UserEntity;
        const isEmail = await UserRecord.checkEmail(email);

        if(isEmail!==null){
            throw new ValidationError('emailExists')
        }

        if (!email.includes('@')) {
            throw new ValidationError('invalidEmail');
        }
        await UserRecord.updateEmail(userId, email);
        res.json(true);
    });
