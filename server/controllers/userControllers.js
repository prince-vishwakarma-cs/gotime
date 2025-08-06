import { pool } from "../api/index.js";

export const getMyRegistrations = async (req, res) => {
    try {
        const userId = req.userId;

        const result = await pool.query(
            `SELECT
                e.id, e.title, e.start_time, e.location, e.image_url,
                r.status
             FROM registrations r
             JOIN events e ON r.event_id = e.id
             WHERE r.user_id = $1
             ORDER BY e.start_time DESC`,
            [userId]
        );

        const now = new Date();
        const upcomingEvents = [];
        const pastEvents = [];

        result.rows.forEach(event => {
            if (new Date(event.start_time) > now) {
                upcomingEvents.push(event);
            } else {
                pastEvents.push(event);
            }
        });

        res.status(200).json({
            success: true,
            registrations: {
                upcoming: upcomingEvents,
                past: pastEvents
            }
        });
    } catch (error) {
        console.error("Error fetching user registrations:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getMyBookmarks = async (req, res) => {
    try {
        const userId = req.userId;

        const result = await pool.query(
            `SELECT
                e.id, e.title, e.start_time, e.location, e.image_url
             FROM bookmarks b
             JOIN events e ON b.event_id = e.id
             WHERE b.user_id = $1
             ORDER BY e.start_time ASC`,
            [userId]
        );

        res.status(200).json({ success: true, bookmarks: result.rows });
    } catch (error) {
        console.error("Error fetching user bookmarks:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};