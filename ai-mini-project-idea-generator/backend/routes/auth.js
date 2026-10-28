const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const supabase = require("../supabase");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
  next();
};
const emailRule = body("email").trim().isEmail().withMessage("Enter a valid email address.").normalizeEmail().isLength({max:254}).withMessage("Email is too long.");
const passwordRule = body("password").isString().isLength({min:8,max:72}).withMessage("Password must be between 8 and 72 characters.");

router.post("/register", [
  body("name").trim().isLength({min:2,max:80}).withMessage("Name must contain 2–80 characters."),
  emailRule, passwordRule, validate
], async (req, res, next) => {
  try {
    const name = req.body.name.trim();
    const email = req.body.email;
    const { data: existing, error: lookupError } = await supabase.from("app_users").select("id").eq("email", email).maybeSingle();
    if (lookupError) throw lookupError;
    if (existing) return res.status(409).json({ error: "An account with this email already exists." });
    const password_hash = await bcrypt.hash(req.body.password, 12);
    const { data: user, error } = await supabase.from("app_users").insert({ name, email, password_hash }).select("id,name,email,created_at").single();
    if (error) {
      if (error.code === "23505") return res.status(409).json({ error: "An account with this email already exists." });
      throw error;
    }
    return res.status(201).json({ token: makeToken(user), user: publicUser(user) });
  } catch (error) { next(error); }
});

router.post("/login", [emailRule, passwordRule, validate], async (req, res, next) => {
  try {
    const { data: user, error } = await supabase.from("app_users").select("id,name,email,password_hash,created_at").eq("email", req.body.email).maybeSingle();
    if (error) throw error;
    if (!user || !(await bcrypt.compare(req.body.password, user.password_hash))) {
      return res.status(401).json({ error: "Email or password is incorrect." });
    }
    return res.json({ token: makeToken(user), user: publicUser(user) });
  } catch (error) { next(error); }
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const { data: user, error } = await supabase.from("app_users").select("id,name,email,created_at").eq("id", req.user.id).maybeSingle();
    if (error) throw error;
    if (!user) return res.status(401).json({ error: "Account no longer exists. Please register again." });
    res.json({ user });
  } catch (error) { next(error); }
});

function makeToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET, { algorithm: "HS256", expiresIn: "2h", issuer: "ideaspark" });
}
function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, created_at: user.created_at };
}
module.exports = router;
