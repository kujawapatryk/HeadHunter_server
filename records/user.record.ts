import { ValidationError } from '../utils/errors';
import { RegistrationTokenEntity, UserEntity } from '../types';
import { pool } from '../config/db';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

export class UserRecord implements  UserEntity {

    userId?: string;
    email: string;
    password?: string
    authToken?: string
    userState?: number

    constructor(obj: UserEntity) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!obj.email) {
            throw new ValidationError('emailRequired');
        } else if (!regex.test(obj.email)) {
            throw new ValidationError('invalidEmail');
        }
        this.userId = obj.userId;
        this.email = obj.email;
        this.password = obj.password;
        this.authToken = obj.authToken;
        this.userState = obj.userState;
    }
    async insert():Promise<void>{
        this.password = '';
        this.authToken = null;
        this.userState = 0;

        await pool('users').insert({
            userId: this.userId,
            email: this.email,
            password: this.password,
            authToken: this.authToken,
            userState: this.userState
        }).catch(() => {
            throw new ValidationError('userAddFailed')
        });
    }

    async hashPassword(password: string, salt: string): Promise<string> {
        try {
            return await bcrypt.hash(password, salt);
        } catch (err) {
            throw new ValidationError('tryLater');
        }
    }

    async newHashPassword(password: string) {
        const salt = bcrypt.genSaltSync(10);
        const hash = await this.hashPassword(password, salt)
        return { password: hash, salt: salt }
    }

    checkPasswordStrength() {
        const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/; // cyfra/mała litera/duża litera/znakspecjalny/min 8 znaków
        return passwordRegex.test(this.password);
    }

    static async getOne(email: string):Promise<UserRecord | null> {

        const results = await pool('users')
            .select('*')
            .where('email', email)
            .first() as UserEntity;
        return results ? new UserRecord(results) : null;

    }

    async checkPassword() {
        if (this.checkPasswordStrength()) {
            const user: UserRecord | null = await UserRecord.getOne(this.email);
            if (user === null) {
                throw new ValidationError('invalidEmail');
            }
            try {
                if (await bcrypt.compare(this.password, user.password)){
                    return {
                        id: user.userId,
                        state: user.userState
                    }

                }
            } catch (err) {
                console.error(err.message);
                throw new ValidationError('tryLater');
            }
        } else {
            throw new ValidationError('passwordInsecure')
        }
    }

    static async checkToken(token: string): Promise<string | null> {

        const results = await pool('registration_tokens')
            .select('*')
            .where('registrationToken',token)
            .first() as RegistrationTokenEntity

        if (results === null) {
            return('Błąd: brak tokena!');
        }
        return (results.tokenExpiresOn).getTime() < Date.now() ? null : results.userId;
    }

    static async checkEmail(email: string): Promise<string | null> {

        const results = await pool('users')
            .select('userId')
            .where('email',email)
            .first() as { userId:string }

        return results === null ? null : results.userId;
    }

    static async addToken(id: string): Promise<string> {
        let newToken, isThisToken;
        do {
            newToken = uuid();
            const results = await  pool('registration_tokens')
                .select('userId')
                .where('registrationToken',newToken) as UserRecord[];

            isThisToken = results.length;
        } while (isThisToken > 0)
        const results = await pool('registration_tokens')
            .select('userId')
            .where('userId',id) as RegistrationTokenEntity[];

        if (results.length > 0) {
            await pool('registration_tokens')
                .where('userId', id)
                .del();
        }
        await pool('registration_tokens')
            .insert({
                userId: id,
                registrationToken: newToken,
                tokenExpiresOn: pool.raw('ADDDATE(NOW(), INTERVAL 1 DAY)'),
            })
        return newToken;
    }

    static async updatePassword(id: string, hashPassword: string): Promise<void> {
        await pool('users')
            .where('userId', id)
            .update({ password: hashPassword });

        await pool('registration_tokens')
            .where('userId',id)
            .del();
    }

    static async updateEmail(id: string, email: string): Promise<void> {
        await pool('user')
            .where('userId',id)
            .update({ email });
    }

    static async updateStudentStatus(studentId: string, userStatus: number): Promise<void> {

        await pool('students')
            .where({ studentId })
            .update({ userStatus })
    }

    static async getEmail(userId: string): Promise<string> {
        const results = await  pool('users')
            .select('email')
            .where({ userId })
            .first() as { email: string };

        return results === null ? null : results.email;

    }
}