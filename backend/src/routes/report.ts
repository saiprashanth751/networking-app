import express from 'express';
import { reportPost, getUserReports } from '../controllers/report';
import { authMiddleware } from '../middleware/authMiddleware';

const app = express.Router();

app.post('/post/:postId', authMiddleware, reportPost);
app.get('/user', authMiddleware, getUserReports);

export default app;
