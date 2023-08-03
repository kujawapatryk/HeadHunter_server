import express, { json } from 'express';
import cors from 'cors';
import 'express-async-errors';
import { adminRouter } from './routers/admin.router';
import { homeRouter } from './routers/home.router';
import { studentRouter } from './routers/student.router';
import { userRouter } from './routers/user.router';
import { hrRouter } from './routers/hr.router';
import { authRouter } from './routers/auth.router';
import { handleError } from './utils/errors';
import { config } from './config/config';
import cookieParser from 'cookie-parser';

const app = express();

app.use(json());
app.use(cookieParser());

app.use(
    cors({
        origin: config.corsOrigin,
        credentials: true,
    }),
);

app.use('/user', userRouter);
app.use('/student', studentRouter);
app.use('/hr', hrRouter);
app.use('/manage', adminRouter);
app.use('/', homeRouter);
app.use('/auth', authRouter);
app.use(handleError);

app.listen(3001, '127.0.0.1', () => {
    console.log('Listening on http://127.0.0.1:3001');

});
