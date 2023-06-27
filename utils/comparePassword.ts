import { ValidationError } from './errors';

export const comparePassword = (password:string, confirmedPassword:string) => {
    if(password !== confirmedPassword)
        throw new ValidationError('mismatchedPasswords');

    return true;
}