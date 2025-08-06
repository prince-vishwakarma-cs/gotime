import { Router } from "express";
import {
  allUsers,
  changePassword,
  createUser,
  deleteAccount,
  getMyBookmarks,
  getMyRegistrations,
  me,
  updateUserProfile,
} from "../controllers/userControllers.js";
import {
  adminAuthenticated,
  isAuthenticated,
  validateAccountDeletion,
  validatePasswordChange,
  validateProfileUpdate,
  validateUserRegistration,
} from "../middlewares/user.js";
import { getMyCreatedEvents } from "../controllers/eventsControllers.js";

const router = Router();

// --- Collection Routes (prefixed with /users) ---
// GET /users (admin only)
router.get("/", isAuthenticated, adminAuthenticated, allUsers);
// POST /users
router.post("/", validateUserRegistration, createUser);

// --- Current User ("me") Routes ---
// These will correctly map to /users/me, /users/me/password, etc.
router.get("/me", isAuthenticated, me);
router.put("/me", isAuthenticated, validateProfileUpdate, updateUserProfile);
router.delete("/me", isAuthenticated, validateAccountDeletion, deleteAccount);
router.put("/me/password", isAuthenticated, validatePasswordChange, changePassword);

// --- User-Specific Event Routes ---
router.get("/me/created-events", isAuthenticated, getMyCreatedEvents);
router.get("/me/registrations", isAuthenticated, getMyRegistrations);
router.get("/me/bookmarks", isAuthenticated, getMyBookmarks);

export default router;