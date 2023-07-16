import { Request, Response, Router } from 'express';
import { UserRecord } from '../records/user.record';
import { ValidationError } from '../utils/errors';
import { comparePassword } from '../utils/validation/comparePassword';
import { auth } from '../auth/auth';
import { UserEntity, UserState } from '../types';
import { emailRegex } from '../utils/validation/emailRegex';
import { passwordRegex } from '../utils/validation/passwordRegex';

export const userRouter = Router();

userRouter

    .post('/my-status', async (req, res) => {
        const { studentId, userStatus } = req.body;
        await UserRecord.updateStudentStatus(studentId, userStatus);
        res.json(true);
        // przyjmuje dane o statusie (zatrudniony lub nie)  i  wprowadza zmiany w bazie
    })

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

    //@TODO sprawdzić, brak autoryzacji, link z maila
    .patch('/new-password', auth([UserState.admin, UserState.hr, UserState.student]), async (req, res) =>{
        const { token, password, confirmedPassword } = req.body;
        const { userId } = req.user  as UserEntity;
        await UserRecord.checkToken(token, userId);

        comparePassword(password,confirmedPassword);

        const user = new UserRecord({ userId,password });
        await user.updatePassword();
        await user.deleteToken();
        res.json({ message: 'passwordSuccessfullyChanged' }).status(200);

    })

    .patch('/change-email', auth([UserState.admin, UserState.hr, UserState.student]), async (req: Request, res: Response) => {
        const { email: newEmail, password } = req.body;
        const { userId, email } = req.user  as UserEntity;
        const isEmail = await UserRecord.checkEmail(newEmail);

        if(isEmail!==null){
            throw new ValidationError('emailExists')
        }
        emailRegex(newEmail);
        const user = new UserRecord({ email, password });
        await user.checkPassword();
        await UserRecord.updateEmail(userId, newEmail);
        res.json({ status: true, message: 'emailChanged' });
    })
    .patch('/change-password', auth([UserState.admin, UserState.hr, UserState.student]), async (req: Request, res: Response) => {
        const { password, confirmedPassword } = req.body;
        const { userId } = req.user  as UserEntity;
        passwordRegex(password);
        comparePassword(password, confirmedPassword);
        const user = new UserRecord({ userId,password });

        await user.updatePassword();
        res.json({ message: 'passwordChanged' }).status(200);
    })
;
