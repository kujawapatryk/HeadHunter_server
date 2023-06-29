import { Request, Response, Router } from 'express';
import { UserRecord } from '../records/user.record';
import { ValidationError } from '../utils/errors';
import { comparePassword } from '../utils/comparePassword';

export const userRouter = Router();

userRouter

    .post('/login', async (req: Request, res: Response) => {
        const params = new UserRecord(req.body);
        const response = await params.checkPassword();
        if (response.id) {
            res.json(response);
            // const token = jwt.sign({ email: newParams.email }, /* @todo SET SECRET KEY process.env.secret_key*/'SEKRET', { expiresIn: '24h' });
            // res.json({ token });
        } else {
            throw new ValidationError('Błędne hasło')
        }

    })
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
    .patch('/new-password',async (req,res) =>{
        const { userId, token, password, confirmedPassword } = req.body;
        console.log({ userId, token, password, confirmedPassword })
        await UserRecord.checkToken(token, userId);
        comparePassword(password,confirmedPassword);
        const user = new UserRecord({ userId,password });
        console.log(user.password);
        console.log(await user.hashPassword());
        console.log(user.password);
        console.log(user);
        await user.updatePassword();
        await user.deleteToken();
        res.json({ message: 'passwordSuccessfullyChanged' }).status(200);

    })

// .patch('/newpass', async (req: Request, res: Response) => {
//     const { id, pass, pass2 } = req.body;
//
//     const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;
//
//     if (!passwordRegex.test(pass)) {
//         throw new ValidationError('invalidPasswordFormat');
//     }
//     if (pass !== pass2) {
//         throw new ValidationError('mismatchedPasswords');
//     }
//     const hashPassword = await hash(pass, 10);
//     await UserRecord.updatePassword(id, hashPassword); //@ TODO do poprawy. zrobić to jako klasa
//     res.json(true);
// })

    .patch('/changemail', async (req: Request, res: Response) => {
        const { id, email } = req.body;
        const isEmail = await UserRecord.checkEmail(email);

        if(isEmail!==null){
            throw new ValidationError('emailExists')
        }

        if (!email.includes('@')) {
            throw new ValidationError('invalidEmail');
        }
        await UserRecord.updateEmail(id, email);
        res.json(true);
    });
