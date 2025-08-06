import { Router } from "express";
import { login, logout } from "../controllers/userControllers.js";
import { isAuthenticated, validateUserLogin } from "../middlewares/user.js";

const router = Router();

router.post("/login", validateUserLogin, login);
router.post("/logout", isAuthenticated, logout);

export default router;