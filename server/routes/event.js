import { Router } from "express";
import {
  createEvent,
  deleteEvent,
  getAllEvents,
  getEventById,
  getEventStats,
  getEventRegistrations,
  getEventWaitlist,
  getGoogleCalendarLink,
  getShareableLink,
  getTrendingEvents,
  upcomingEvents,
  updateEvent,
} from "../controllers/eventsControllers.js";
import {
  addBookmark,
  registerForEvent,
  removeBookmark,
  unregisterFromEvent,
} from "../controllers/userInteractions.js";
import { isAuthenticated } from "../middlewares/user.js";
import { validateEventData, validateEventId } from "../middlewares/event.js";

const router = Router();

// --- Top-Level Routes (Static before Dynamic) ---

// 1. Static routes come first to avoid being captured by an ID parameter.
router.get("/trending", getTrendingEvents);
router.get("/upcoming", isAuthenticated, upcomingEvents); // Assumes you want a separate "upcoming" view

// 2. The main collection routes for GET (with search) and POST.
router.get("/", isAuthenticated, getAllEvents); // The main endpoint to get all events
router.post("/", isAuthenticated, validateEventData, createEvent);

// --- Event-Specific Routes (All use /:eventId) ---

// 3. General routes for a specific event ID.
router.get("/:eventId", validateEventId, getEventById);
router.put("/:eventId", isAuthenticated, validateEventId, validateEventData, updateEvent);
router.delete("/:eventId", isAuthenticated, validateEventId, deleteEvent);

// 4. Sub-routes for a specific event ID. These are more specific and can come after.
router.get("/:eventId/stats", isAuthenticated, validateEventId, getEventStats);
router.get("/:eventId/google-calendar", validateEventId, getGoogleCalendarLink);
router.get("/:eventId/share", validateEventId, getShareableLink);
router.get("/:eventId/registrations", isAuthenticated, validateEventId, getEventRegistrations);
router.get("/:eventId/waitlist", isAuthenticated, validateEventId, getEventWaitlist);

// --- User Interaction Routes on a Specific Event ---
router.post("/:eventId/register", isAuthenticated, validateEventId, registerForEvent);
router.delete("/:eventId/unregister", isAuthenticated, validateEventId, unregisterFromEvent);
router.post("/:eventId/bookmark", isAuthenticated, validateEventId, addBookmark);
router.delete("/:eventId/bookmark", isAuthenticated, validateEventId, removeBookmark);

export default router;