import { Router } from 'express';
import { StudentRecord } from '../records/student.record';
import { StudentFilter } from '../records/student.filter';
import { FilterQuery, UpdateStatus, UserEntity, UserState } from '../types';
import multer from 'multer';
import { convertTypes } from '../utils/convertTypes';
import { hrExists } from '../utils/hrExists';
import { auth } from '../auth/auth';

const upload = multer({ dest: './utils/download/' })

export const studentRouter = Router();

studentRouter

    .get('/students', auth([UserState.hr]), async (req, res) => {
        const query = convertTypes(req.query) as FilterQuery;
        const { userId } = req.user as UserEntity;
        const queryWithHr = {
            ...query,
            hrId: userId
        }
        const availableStudents = new StudentFilter(queryWithHr);
        await hrExists(availableStudents.hrId);
        const data = await availableStudents.getStudents();
        const allRecords = await availableStudents.allRecordsStudent();
        const newData = {
            allRecords: allRecords,
            data: data,
        }

        res.json(newData);
    })

    .patch('/status', auth([UserState.hr]), async (req, res) => {
        const { action, studentId }: UpdateStatus = req.body;
        const { userId } = req.user as UserEntity;
        await hrExists(userId);
        const message = await StudentRecord.statusChange(action, studentId, userId);

        res.status(200)
            .json({ success: true, message: message });
    })

    .get('/getcv/:studentId', auth([UserState.hr]), async (req, res) => {
        const { studentId }= req.params;
        const { userId } = req.user as UserEntity;
        await hrExists(userId);
        const data = await StudentRecord.getCvOneStudent(studentId);
        res.json(data);
    })

    .get('/get-cv-edit', auth([UserState.student]), async (req, res) => {
        const { userId } = req.user as UserEntity;
        const data = await StudentRecord.getCvOneStudentEdit(userId);
        res.json(data).status(200);
    })

    .patch('/change-data', auth([UserState.student]), async (req, res) => {
        const { userId } = req.user as UserEntity;
        const student = {
            ...req.body,
            studentId: userId,
        }
        const newStudent = new StudentRecord(student);
        const data = await newStudent.update();
        res.json(data);
    })

    .post('/newstudents', upload.single('dataFile'), async (req, res) => {
        await StudentRecord.addNewStudent(req.file.filename);
        res.status(200).json({ success: true, message: 'Kursanci zostali dodani' });
    })

    .get('/name/:id', async (req, res) => {
        const studentId = req.params.id;
        const { firstName, lastName, githubUsername } = (await StudentRecord.getCvOneStudent(studentId));
        res.json({ firstName, lastName, githubUsername });
    })
