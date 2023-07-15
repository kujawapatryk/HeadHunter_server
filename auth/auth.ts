import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserRecord } from '../records/user.record';
import { config } from '../config/config';
import { ValidationError } from '../utils/errors';
import { UserEntity } from '../types';

type DecodedToken = {
    id: string,
    iat: number,
    exp: number,
}

export const auth = (states: number[]) => async  (req: Request, res: Response, next: NextFunction) => {

    try {
        const { token }  = req.cookies;
        if (!token) return res.status(403).json({ message: 'Nie znaleziono tokena.' });

        jwt.verify(token, config.JWT_SECRET, async (err: jwt.VerifyErrors) => {
            if (err) return res.status(403).send('Nieprawidłowy token.');
        });

        const decoded: DecodedToken = jwt.verify(token, config.JWT_SECRET) as DecodedToken;
        const user: UserEntity = await UserRecord.getEmail(decoded.id);

        if (!user) return res.status(401).send('Nieautoryzowany użytkownik.');

        if(states.indexOf(user.userState) === -1)
            throw new ValidationError('unAuthorized');

        req.user = user;
        next();
    } catch (err) {
        next(err);
    }

};