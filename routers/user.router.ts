import {Request, Response, Router} from "express";
import {UserRecord} from "../records/user.record";
import {ValidationError} from "../utils/errors";
import {hash} from "bcrypt";

export const userRouter = Router();

userRouter

    .get("/token/:token", async (req: Request, res: Response) => {
        const userId: string | null = await UserRecord.checkToken(req.params.token);
        res.json(userId);
    })

    .get("/email/:email", async (req: Request, res: Response) => {
        const userId: string | null = await UserRecord.checkEmail(req.params.email);
        if (userId === null) {
            throw new ValidationError('Nie ma takiego adresu e-mail');
        }
        await UserRecord.addToken(userId);
        res.json(req.params.email);
    })

    .patch("/newpass", async (req: Request, res: Response) => {
        const {id, pass, pass2} = req.body;

        const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;

        if (!passwordRegex.test(pass)) {
            throw new ValidationError('Hasło musi mieć co najmniej 8 znaków, składać się z dużych i małych liter, cyfr i znaków specjalnych');
        }
        if (pass !== pass2) {
            throw new ValidationError('Hasła są różne');
        }
        const hashPassword = await hash(pass, 10);
        await UserRecord.updatePassword(id, hashPassword);
        res.json(id);
    });