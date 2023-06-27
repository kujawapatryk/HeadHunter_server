import { ValidationError } from '../utils/errors';
import { RegistrationTokenEntity, UserEntity } from '../types';
import { pool } from '../config/db';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { sendMail } from '../utils/sendMail';
import { config } from '../config/config';

export class UserRecord implements  UserEntity {

    userId?: string;
    email?: string;
    password?: string
    authToken?: string
    userState?: number

    constructor(obj: UserEntity) {
    //    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // if (!obj.email) {
        //     throw new ValidationError('emailRequired');
        // } else if (!regex.test(obj.email)) {
        //     throw new ValidationError('invalidEmail');
        // }
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

    // async hashPassword(password: string, salt: string): Promise<string> {
    //     try {
    //         return await bcrypt.hash(password, salt);
    //     } catch (err) {
    //         throw new ValidationError('tryLater');
    //     }
    // }

    static async resetPassword(email:string){
        const regexEmail = /^\S+@\S+\.\S+$/;
        if(!regexEmail.test(email))
            throw new ValidationError('invalidEmail');

        const result = await pool('users')
            .select('userId')
            .where({ email })
            .first() as { userId:string }
        if(result === undefined)
            throw new ValidationError('invalidEmail');

        const token = await UserRecord.addToken(result.userId);
        await sendMail(email,'Zresetuj hasło Headhanter',`aby zresetować hasło wejdz na adress ${config.corsOrigin}/new-password/${token}/${result.userId} `);

    }

    checkPasswordStrength(): boolean {
        const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/; // cyfra/mała litera/duża litera/znakspecjalny/min 8 znaków
        if(!passwordRegex.test(this.password))
            throw new ValidationError('invalidPasswordFormat');
        return true
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

    static async checkToken(token: string, userId: string): Promise<true> {

        const result = await pool('registration_tokens')
            .select('userId')
            .where('registrationToken',token)
            .where({ userId })
            .where('tokenExpiresOn', '>',new Date())
            .first() as { userId: string }

        if (result === undefined)
            throw new ValidationError('tokenExpired')

        return true
    }

    static async checkEmail(email: string): Promise<string | null> {

        const results = await pool('users')
            .select('userId')
            .where('email',email)
            .first() as { userId:string }

        return results === undefined ? null : results.userId;
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

    async hashPassword(): Promise<void> {
        try {
            const salt = bcrypt.genSaltSync(10);
            this.password = await bcrypt.hash(this.password, salt)
        }catch (e){
            throw new ValidationError('tryLater');
        }
    }

    async updatePassword(): Promise<void> {
        this.checkPasswordStrength();
        await this.hashPassword;

        await pool('users')
            .where('userId', this.userId)
            .update({ password: this.password });
    }

    async deleteToken(){
        await pool('registration_tokens')
            .where('userId',this.userId)
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