import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { v4 as uuid } from 'uuid';
import { pool } from '../config/db';

export const createToken = (token: string): string => {
    const accessToken = jwt.sign(
        { id: token },
        config.JWT_SECRET,
        { expiresIn: '24h' });

    return accessToken;
}

export const generateToken = async (userId: string): Promise<string> => {
    let token;
    let userWithThisToken: string[] | null = null;
    do {
        token = uuid();
        userWithThisToken = await pool('users')
            .select('*')
            .where('authToken', token);
    }while (userWithThisToken.length > 0)

    await pool('users')
        .update('authToken', token)
        .where({ userId })
    
    return token;
}