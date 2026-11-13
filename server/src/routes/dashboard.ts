// THIS IS JUST A TEMPORARY ROUTER, SWAP ACCORDINGLY.

import express from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
    const userId = req.session.userId;
    const [groupsResult, notificationsResult] = await Promise.all([
        pool.query(
        `SELECT g.id, g.name, g.meeting_mode, g.chat_url, c.code AS course_code
        FROM group_members gm
        JOIN groups g ON g.id = gm.group_id
        LEFT JOIN courses c ON c.id = g.course_id
        WHERE gm.user_id = $1
        ORDER BY g.name, g.id`,
            [userId]
        ),
        pool.query(
            `SELECT n.id, n.type, n.read_at, n.created_at,
                    g.name AS group_name, actor.display_name AS actor_name
            FROM notifications n
            LEFT JOIN groups g ON g.id = n.group_id
            LEFT JOIN users actor ON actor.id = n.actor_id
            WHERE n.user_id = $1
            ORDER BY n.created_at DESC, n.id DESC`,
            [userId]
        ),
    ]);

    return res.json({ groups: groupsResult.rows, notifications: notificationsResult.rows });
});

export default router;
