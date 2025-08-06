import jwt from "jsonwebtoken";

export const JWT_SECRET = process.env.JWT_SECRET || "yourSecretKey";
export const JWT_EXPIRES_IN = "7d";
export const COOKIE_NAME = "auth_token";
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const BCRYPT_SALT_ROUNDS = 10;
export const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || 'http://localhost:3000';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: NODE_ENV === "production",
  sameSite: "Lax",
};

export const sendTokenCookie = (res, user) => {
  const token = jwt.sign({ id: user.id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  res.cookie(COOKIE_NAME, token, {
    ...COOKIE_OPTIONS,
    maxAge: COOKIE_MAX_AGE,
  });
};

export const clearTokenCookie = (res) => {
  res.cookie(COOKIE_NAME, "", {
    ...COOKIE_OPTIONS,
    expires: new Date(0),
  });
};
