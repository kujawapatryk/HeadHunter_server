import { ValidationError } from '../errors';

export const emailRegex = (email: string):void => {
    const regex = /^\S+@\S+\.\S+$/;
    if(!regex.test(email))
        throw new ValidationError('invalidEmail');
}