/**
 * OPTIONAL alternative to Formspree — a minimal, self-hosted contact-form
 * handler satisfying PRD §9.5 and §11 (rate limiting, validation, no stored
 * secrets in client code). Only needed if you do NOT want to use Formspree.
 *
 * Setup:
 *   npm init -y
 *   npm install express cors express-rate-limit nodemailer dotenv
 *   node server.js
 *
 * Then in contact.html, change the form's `action` to your deployed
 * endpoint, e.g. https://your-api.example.com/api/contact, and change
 * assets/js/main.js's fetch call to send JSON instead of FormData if you
 * prefer (both are supported below).
 *
 * Environment variables (.env — never commit this file):
 *   SMTP_HOST=...
 *   SMTP_PORT=587
 *   SMTP_USER=...
 *   SMTP_PASS=...
 *   MAIL_TO=stay@dreampension.com
 *   ALLOWED_ORIGIN=https://your-deployed-site.example.com
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const nodemailer = require("nodemailer");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS: only allow requests from the deployed site, not "*"
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || "http://localhost:8080" }));

// Rate limiting: a handful of submissions per minute per IP (PRD §11)
const contactLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: "Too many requests. Please try again in a minute." },
});

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

function sanitize(str) {
  return String(str || "").replace(/[<>]/g, "").trim().slice(0, 5000);
}

app.post("/api/contact", contactLimiter, async (req, res) => {
  const { name, email, subject, message, company } = req.body;

  // Honeypot: bots fill hidden fields — silently accept without sending mail
  if (company) {
    return res.json({ ok: true });
  }

  const cleanName = sanitize(name);
  const cleanEmail = sanitize(email);
  const cleanSubject = sanitize(subject) || "New enquiry from website";
  const cleanMessage = sanitize(message);

  if (!cleanName || !isValidEmail(cleanEmail) || !cleanMessage) {
    return res.status(400).json({ ok: false, error: "Missing or invalid required fields." });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
      from: `"Dream Pension Website" <${process.env.SMTP_USER}>`,
      to: process.env.MAIL_TO,
      replyTo: cleanEmail,
      subject: `[Dream Pension] ${cleanSubject}`,
      text: `Name: ${cleanName}\nEmail: ${cleanEmail}\n\n${cleanMessage}`,
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error("Mail send failed:", err.message);
    return res.status(500).json({ ok: false, error: "Could not send message. Please try again later." });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Contact handler listening on :${PORT}`));
