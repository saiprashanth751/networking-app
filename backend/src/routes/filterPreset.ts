import express from 'express';
import { saveFilterPreset, getUserPresets, deletePreset } from '../controllers/filterPreset';
import { authMiddleware } from '../middleware/authMiddleware';

const app = express.Router();

app.post('/', authMiddleware, saveFilterPreset);
app.get('/', authMiddleware, getUserPresets);
app.delete('/:presetId', authMiddleware, deletePreset);

export default app;
