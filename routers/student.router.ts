import { Router } from 'express';
import { StudentRecord } from '../records/student.record';
import { StudentFilter } from '../records/student.filter';
import { FilterQuery, UpdateStatus } from '../types';
import multer from 'multer';
import { convertTypes } from '../utils/convertTypes';
import { hrExists } from '../utils/hrExists';

const upload = multer({ dest: './utils/download/' })

export const studentRouter = Router();

studentRouter

    .get('/students', async (req, res) => {
        const query= convertTypes(req.query) as FilterQuery;
        const availableStudents = new StudentFilter(query);
        await hrExists(availableStudents.hrId);
        const data = await availableStudents.getStudents();
        const allRecords = await availableStudents.allRecordsStudent();
        const newData = {
            allRecords: allRecords,
            data: data,
        }

        res.json(newData);
    })

    .patch('/status', async (req, res) => {
        const { action, studentId, hrId }: UpdateStatus = req.body;
        await hrExists(hrId);
        const message = await StudentRecord.statusChange(action, studentId, hrId);
        res.status(200).json({ success: true, message: message });
    })

    .get('/getcv/:studentId/:hrId', async (req, res) => {
        const { studentId, hrId }= req.params;
        await hrExists(hrId);
        const data = await StudentRecord.getCvOneStudent(studentId);
        res.json(data);
    })

    .get('/getcvedit/:studentId', async (req, res) => {
        const studentId = req.params.studentId;
        const data = await StudentRecord.getCvOneStudentEdit(studentId);
        res.json(data);
    })

    .patch('/changedata', async (req, res) => {
        const newStudent = new StudentRecord(req.body);
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
