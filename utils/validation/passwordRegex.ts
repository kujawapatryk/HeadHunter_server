import { ValidationError } from '../errors';

export const passwordRegex = (password: string):boolean => {
    const regex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;
    if(!regex.test(password))
        throw new ValidationError('invalidPasswordFormat');
    return true
}