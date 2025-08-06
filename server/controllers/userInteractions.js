import { pool } from "../api/index.js";

export const registerForEvent = async (req, res) => {
  const { eventId } = req.params;
  const userId = req.userId;
  const client = await pool.connect(); // Get a client from the pool for transaction

  try {
    await client.query("BEGIN"); // Start transaction

    // 1. Check if user is already registered or waitlisted
    const existingRegistration = await client.query(
      `SELECT * FROM registrations WHERE user_id = $1 AND event_id = $2`,
      [userId, eventId]
    );

    if (existingRegistration.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "You are already registered or on the waitlist for this event." });
    }

    // 2. Lock the event row and get capacity and current registration count
    const eventResult = await client.query(
      `SELECT capacity FROM events WHERE id = $1 FOR UPDATE`,
      [eventId]
    );

    if (eventResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Event not found." });
    }

    const capacity = eventResult.rows[0].capacity;
    const registrationCountResult = await client.query(
        `SELECT COUNT(*) FROM registrations WHERE event_id = $1 AND status = 'registered'`,
        [eventId]
    );
    const registeredCount = parseInt(registrationCountResult.rows[0].count, 10);
    
    // 3. Decide whether to register or waitlist the user
    if (registeredCount < capacity) {
      // Register user
      await client.query(
        `INSERT INTO registrations (user_id, event_id, status) VALUES ($1, $2, 'registered')`,
        [userId, eventId]
      );
      await client.query("COMMIT"); // Commit transaction
      res.status(201).json({ success: true, message: "Successfully registered for the event." });
    } else {
      // Add user to waitlist
      await client.query(
        `INSERT INTO registrations (user_id, event_id, status) VALUES ($1, $2, 'waitlisted')`,
        [userId, eventId]
      );
      await client.query("COMMIT"); // Commit transaction
      res.status(200).json({ success: true, message: "The event is full. You have been added to the waitlist." });
    }
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error registering for event:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release(); // Release the client back to the pool
  }
};

export const unregisterFromEvent = async (req, res) => {
    const { eventId } = req.params;
    const userId = req.userId;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Delete the user's registration and check if they were 'registered'
        const deleteResult = await client.query(
            `DELETE FROM registrations WHERE user_id = $1 AND event_id = $2 RETURNING status`,
            [userId, eventId]
        );

        if (deleteResult.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: "You were not registered for this event." });
        }

        const wasRegistered = deleteResult.rows[0].status === 'registered';

        // 2. If a registered user left, try to promote someone from the waitlist
        if (wasRegistered) {
            const waitlistUser = await client.query(
                `SELECT id FROM registrations 
                 WHERE event_id = $1 AND status = 'waitlisted' 
                 ORDER BY registered_at ASC LIMIT 1 FOR UPDATE`,
                [eventId]
            );

            if (waitlistUser.rows.length > 0) {
                const promotedUserId = waitlistUser.rows[0].id;
                await client.query(
                    `UPDATE registrations SET status = 'registered' WHERE id = $1`,
                    [promotedUserId]
                );
                // In a real app, you would also email or notify the promoted user here.
            }
        }

        await client.query('COMMIT');
        res.status(200).json({ success: true, message: "You have been unregistered from the event." });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error unregistering from event:", error);
        res.status(500).json({ error: "Internal server error" });
    } finally {
        client.release();
    }
};

export const addBookmark = async (req, res) => {
    try {
        const { eventId } = req.body;
        const userId = req.userId;

        if (!eventId) {
            return res.status(400).json({ error: "eventId is required." });
        }

        await pool.query(
            `INSERT INTO bookmarks (user_id, event_id) VALUES ($1, $2)`,
            [userId, eventId]
        );

        res.status(201).json({ success: true, message: "Event bookmarked successfully." });
    } catch (error) {
        if (error.code === '23505') { // Unique constraint violation
            return res.status(409).json({ error: "Event is already bookmarked." });
        }
        console.error("Error adding bookmark:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const removeBookmark = async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.userId;

        const result = await pool.query(
            `DELETE FROM bookmarks WHERE user_id = $1 AND event_id = $2`,
            [userId, eventId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Bookmark not found." });
        }

        res.status(200).json({ success: true, message: "Bookmark removed successfully." });
    } catch (error) {
        console.error("Error removing bookmark:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};