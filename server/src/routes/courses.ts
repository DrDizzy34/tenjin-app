import express from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
    // Query and store all of the courses, before returning.
    const coursesResult = await pool.query(
        'SELECT id, code, title FROM courses ORDER BY code'
    );
    return res.json(coursesResult.rows);
});

export default router;