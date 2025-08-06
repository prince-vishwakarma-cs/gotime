import { pool } from "../api/index.js";

export const createEvent = async (req, res) => {
  try {
    const {
      title,
      start_time,
      end_time,
      location,
      capacity,
      description,
      is_public,
      image_url,
    } = req.body;
    const organizer_id = req.userId;

    const result = await pool.query(
      `INSERT INTO events (title, start_time, end_time, location, capacity, description, is_public, image_url, organizer_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        title,
        start_time,
        end_time,
        location,
        capacity,
        description,
        is_public,
        image_url,
        organizer_id,
      ]
    );

    res.status(201).json({ success: true, event: result.rows[0] });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const upcomingEvents = async (req, res) => {
  try {
    // This is now optional. It can be a user ID or undefined.
    const userId = req.userId;
    const { search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let mainQuery;
    const queryParams = [];

    // --- Dynamic Query Building ---

    // The count query remains the same for both cases
    let countQuery = `SELECT COUNT(*) FROM events WHERE is_public = true AND start_time > NOW()`;
    const countParams = [];

    if (userId) {
      // --- Query for LOGGED-IN users (with personalized data) ---
      mainQuery = `
        SELECT
          e.id, e.title, e.start_time, e.location, e.image_url, e.capacity,
          u.name AS organizer_name,
          EXISTS (
            SELECT 1 FROM registrations r WHERE r.event_id = e.id AND r.user_id = $1
          ) AS is_registered,
          e.capacity - (SELECT COUNT(*) FROM registrations WHERE event_id = e.id AND status = 'registered')::int AS available_seats
        FROM events e
        JOIN users u ON e.organizer_id = u.id
        WHERE e.is_public = true AND e.start_time > NOW()
      `;
      queryParams.push(userId);
    } else {
      // --- Query for ANONYMOUS users (is_registered is always false) ---
      mainQuery = `
        SELECT
          e.id, e.title, e.start_time, e.location, e.image_url, e.capacity,
          u.name AS organizer_name,
          false AS is_registered,
          e.capacity - (SELECT COUNT(*) FROM registrations WHERE event_id = e.id AND status = 'registered')::int AS available_seats
        FROM events e
        JOIN users u ON e.organizer_id = u.id
        WHERE e.is_public = true AND e.start_time > NOW()
      `;
    }

    let placeholderCount = queryParams.length + 1;

    if (search) {
      mainQuery += ` AND e.title ILIKE $${placeholderCount}`;
      countQuery += ` AND title ILIKE $1`; // countQuery only has one param
      queryParams.push(`%${search}%`);
      countParams.push(`%${search}%`);
      placeholderCount++;
    }

    mainQuery += ` ORDER BY e.start_time ASC LIMIT $${placeholderCount} OFFSET $${placeholderCount + 1}`;
    queryParams.push(limit, offset);

    // --- Database Execution ---
    const eventsResult = await pool.query(mainQuery, queryParams);
    const countResult = await pool.query(countQuery, countParams);
    const totalEvents = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalEvents / limit);

    // --- Response ---
    res.status(200).json({
      success: true,
      events: eventsResult.rows,
      pagination: {
        currentPage: parseInt(page, 10),
        totalPages,
        totalEvents,
      },
    });
  } catch (error) {
    console.error("Error fetching upcoming events:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getEventById = async (req, res) => {
  try {
    const { eventId } = req.params;
    const result = await pool.query(
      `SELECT e.*, u.name AS organizer_name FROM events e
       JOIN users u ON e.organizer_id = u.id
       WHERE e.id = $1`,
      [eventId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.status(200).json({ success: true, event: result.rows[0] });
  } catch (error) {
    console.error("Error fetching event by ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.userId;

        const eventResult = await pool.query(`SELECT organizer_id FROM events WHERE id = $1`, [eventId]);
        if (eventResult.rows.length === 0) {
            return res.status(404).json({ error: "Event not found" });
        }
        if (eventResult.rows[0].organizer_id !== userId) {
            return res.status(403).json({ error: "Forbidden: You are not the organizer of this event" });
        }

        const { title, start_time, end_time, location, capacity, description, is_public, image_url } = req.body;
        const result = await pool.query(
            `UPDATE events SET title = $1, start_time = $2, end_time = $3, location = $4, capacity = $5, description = $6, is_public = $7, image_url = $8
             WHERE id = $9 RETURNING *`,
            [title, start_time, end_time, location, capacity, description, is_public, image_url, eventId]
        );

        res.status(200).json({ success: true, event: result.rows[0] });
    } catch (error) {
        console.error("Error updating event:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


export const deleteEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.userId;

        // Verify organizer
        const eventResult = await pool.query(`SELECT organizer_id FROM events WHERE id = $1`, [eventId]);
        if (eventResult.rows.length === 0) {
            return res.status(404).json({ error: "Event not found" });
        }
        if (eventResult.rows[0].organizer_id !== userId) {
            return res.status(403).json({ error: "Forbidden: You are not the organizer of this event" });
        }

        await pool.query(`DELETE FROM events WHERE id = $1`, [eventId]);
        res.status(200).json({ success: true, message: "Event deleted successfully" });
    } catch (error) {
        console.error("Error deleting event:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


// --- Feature Endpoints ---

/**
 * Generates a Google Calendar link for an event.
 * GET /events/:eventId/google-calendar
 */
export const getGoogleCalendarLink = async (req, res) => {
    try {
        const { eventId } = req.params;
        const result = await pool.query(
            `SELECT title, start_time, end_time, location, description FROM events WHERE id = $1`,
            [eventId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Event not found" });
        }

        const event = result.rows[0];
        const formatDate = (date) => new Date(date).toISOString().replace(/-|:|\.\d+/g, "");

        const calendarUrl = new URL("https://www.google.com/calendar/render");
        calendarUrl.searchParams.append("action", "TEMPLATE");
        calendarUrl.searchParams.append("text", event.title);
        calendarUrl.searchParams.append("dates", `${formatDate(event.start_time)}/${formatDate(event.end_time)}`);
        calendarUrl.searchParams.append("details", event.description);
        calendarUrl.searchParams.append("location", event.location);

        res.status(200).json({ success: true, googleCalendarUrl: calendarUrl.toString() });
    } catch (error) {
        console.error("Error generating Google Calendar link:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


/**
 * Generates a shareable link to the event's frontend page.
 * GET /events/:eventId/share (Note: GET is more appropriate than POST here)
 */
export const getShareableLink = (req, res) => {
    const { eventId } = req.params;
    // Replace 'https://your-frontend.com' with your actual frontend domain
    const shareUrl = `${FRONTEND_BASE_URL}/events/${eventId}`;
    res.status(200).json({ success: true, shareUrl });
};



// --- Attendee Management Endpoints ---

/**
 * Gets all registered attendees for an event. Organizer only.
 * GET /events/:eventId/registrations
 */
export const getEventRegistrations = async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.userId;

        // Verify organizer
        const eventResult = await pool.query(`SELECT organizer_id FROM events WHERE id = $1`, [eventId]);
        if (eventResult.rows.length === 0) {
            return res.status(404).json({ error: "Event not found" });
        }
        if (eventResult.rows[0].organizer_id !== userId) {
            return res.status(403).json({ error: "Forbidden: You are not the organizer of this event" });
        }

        const attendeesResult = await pool.query(
            `SELECT u.id, u.name, u.email, r.registered_at FROM registrations r
             JOIN users u ON r.user_id = u.id
             WHERE r.event_id = $1 AND r.status = 'registered'
             ORDER BY r.registered_at ASC`,
            [eventId]
        );
        
        res.status(200).json({ success: true, registrations: attendeesResult.rows });
    } catch (error) {
        console.error("Error fetching event registrations:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * Gets the waitlist for an event. Organizer only.
 * GET /events/:eventId/waitlist
 */
export const getEventWaitlist = async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.userId;

        // Verify organizer
        const eventResult = await pool.query(`SELECT organizer_id FROM events WHERE id = $1`, [eventId]);
        if (eventResult.rows.length === 0) {
            return res.status(404).json({ error: "Event not found" });
        }
        if (eventResult.rows[0].organizer_id !== userId) {
            return res.status(403).json({ error: "Forbidden: You are not the organizer of this event" });
        }

        const waitlistResult = await pool.query(
            `SELECT u.id, u.name, u.email, r.registered_at FROM registrations r
             JOIN users u ON r.user_id = u.id
             WHERE r.event_id = $1 AND r.status = 'waitlisted'
             ORDER BY r.registered_at ASC`,
            [eventId]
        );
        
        res.status(200).json({ success: true, waitlist: waitlistResult.rows });
    } catch (error) {
        console.error("Error fetching event waitlist:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getAllEvents = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `SELECT id, title, start_time, location, image_url FROM events WHERE is_public = true`;
    let countQuery = `SELECT COUNT(*) FROM events WHERE is_public = true`;
    const queryParams = [limit, offset];
    const countParams = [];

    if (search) {
      query += ` AND title ILIKE $3`;
      countQuery += ` AND title ILIKE $1`;
      queryParams.push(`%${search}%`);
      countParams.push(`%${search}%`);
    }

    query += ` ORDER BY start_time ASC LIMIT $1 OFFSET $2`;

    const eventsResult = await pool.query(query, queryParams);
    const countResult = await pool.query(countQuery, countParams);

    const totalEvents = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalEvents / limit);

    res.status(200).json({
      success: true,
      events: eventsResult.rows,
      pagination: {
        currentPage: parseInt(page, 10),
        totalPages,
        totalEvents,
      },
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};




export const getMyCreatedEvents = async (req, res) => {
    try {
        const userId = req.userId;
        const { sortBy } = req.query; // e.g., 'start_time'

        let orderByClause = 'ORDER BY created_at DESC'; // Default sorting

        // Allow user to specify a different sort order
        if (sortBy === 'start_time') {
            orderByClause = 'ORDER BY start_time ASC';
        }

        const query = `
            SELECT 
                id, title, start_time, end_time, location, is_public, created_at,
                (SELECT COUNT(*) FROM registrations WHERE event_id = events.id AND status = 'registered') AS registration_count
            FROM events
            WHERE organizer_id = $1
            ${orderByClause}
        `;

        const result = await pool.query(query, [userId]);

        res.status(200).json({
            success: true,
            events: result.rows
        });

    } catch (error) {
        console.error("Error fetching user's created events:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


export const getTrendingEvents = async (req, res) => {
    try {
        // This query calculates a "trending_score" by counting registrations
        // in the last 3 days for public events that are happening in the future.
        const query = `
            SELECT
                e.id,
                e.title,
                e.start_time,
                e.location,
                e.image_url,
                (SELECT COUNT(*) 
                 FROM registrations r 
                 WHERE r.event_id = e.id AND r.registered_at > NOW() - INTERVAL '3 days'
                ) AS trending_score
            FROM
                events e
            WHERE
                e.is_public = true AND e.start_time > NOW()
            ORDER BY
                trending_score DESC, e.start_time ASC
            LIMIT 10;
        `;

        const result = await pool.query(query);

        res.status(200).json({
            success: true,
            events: result.rows
        });

    } catch (error) {
        console.error("Error fetching trending events:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


export const getEventStats = async (req, res) => {
    try {
        const eventId = parseInt(req.params.eventId);
        const userId = req.userId;

        if (isNaN(eventId)) {
            return res.status(400).json({ error: "Invalid event ID" });
        }

        // 1. Fetch event details and stats in a single query (check-in removed)
        const query = `
            SELECT
                e.title, e.capacity, e.start_time, e.organizer_id,
                (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id AND r.status = 'registered') AS registered_count,
                (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id AND r.status = 'waitlisted') AS waitlist_count,
                (SELECT COUNT(*) FROM bookmarks b WHERE b.event_id = e.id) AS bookmark_count,
                (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id AND r.registered_at > NOW() - INTERVAL '24 hours') AS registrations_last_24h
            FROM events e
            WHERE e.id = $1;
        `;
        const result = await pool.query(query, [eventId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Event not found" });
        }

        const data = result.rows[0];

        // 2. Authorize: Ensure the current user is the organizer
        if (data.organizer_id !== userId) {
            return res.status(403).json({ error: "Forbidden: You are not the organizer of this event." });
        }

        // 3. Parse and Calculate Stats
        const totalRegistrations = parseInt(data.registered_count, 10);
        const capacity = data.capacity;
        
        const capacityUsed = capacity > 0
            ? parseFloat(((totalRegistrations / capacity) * 100).toFixed(2))
            : 0;
            
        const daysUntilEvent = Math.ceil((new Date(data.start_time) - new Date()) / (1000 * 60 * 60 * 24));

        // 4. Assemble the final stats object
        const stats = {
            event_id: eventId,
            event_title: data.title,
            max_capacity: capacity,
            days_until_event: daysUntilEvent > 0 ? daysUntilEvent : 0,
            registration_breakdown: {
                total_confirmed: totalRegistrations,
                waitlisted: parseInt(data.waitlist_count, 10),
            },
            capacity_info: {
                remaining_spots: capacity - totalRegistrations,
                percentage_used: capacityUsed,
            },
            engagement: {
                bookmarks: parseInt(data.bookmark_count, 10),
                registrations_last_24h: parseInt(data.registrations_last_24h, 10),
            },
        };

        res.json({ success: true, stats });

    } catch (error) {
        console.error("Error getting event stats:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};