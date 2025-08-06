export const validateEventData = (req, res, next) => {
    const {
        title,
        start_time,
        end_time,
        location,
        capacity,
        description,
        is_public,
    } = req.body;

    const errors = [];

    // --- Required Fields ---
    if (!title || typeof title !== 'string' || title.trim() === '') {
        errors.push('Title is required.');
    }

    if (!location || typeof location !== 'string' || location.trim() === '') {
        errors.push('Location is required.');
    }

    if (capacity === undefined || !Number.isInteger(capacity) || capacity <= 0) {
        errors.push('Capacity must be a positive integer.');
    }

    // --- Date and Time Validation ---
    const startTime = new Date(start_time);
    const endTime = new Date(end_time);

    if (!start_time || isNaN(startTime.getTime())) {
        errors.push('A valid start_time is required.');
    }
    if (!end_time || isNaN(endTime.getTime())) {
        errors.push('A valid end_time is required.');
    }
    if (startTime >= endTime) {
        errors.push('The end_time must be after the start_time.');
    }
    
    // --- Optional Fields Validation ---
    if (description !== undefined && typeof description !== 'string') {
        errors.push('Description must be a string.');
    }
    if (is_public !== undefined && typeof is_public !== 'boolean') {
        errors.push('is_public must be a boolean.');
    }

    if (errors.length > 0) {
        // ✅ KEY CHANGE: Join all collected errors into a single string
        return res.status(400).json({
            error: errors.join(' '),
        });
    }

    next();
};


export const validateEventId = (req, res, next) => {
    const eventId = parseInt(req.params.eventId, 10);

    if (isNaN(eventId)) {
        return res.status(400).json({
            error: "Invalid event ID format. Must be an integer."
        });
    }

    next();
};
