import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { users, profiles } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, username, displayName } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ error: 'Email, password, and username are required' });
    }

    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await db.insert(users).values({
      email,
      passwordHash,
      emailConfirmed: true, // Auto-confirm for Replit environment
    }).returning();

    if (!newUser.length) {
      throw new Error('Failed to create user');
    }

    // Create profile
    await db.insert(profiles).values({
      userId: newUser[0].id,
      username,
      displayName: displayName || username,
    });

    // Generate token
    const token = generateToken(newUser[0].id, newUser[0].email);

    res.status(201).json({
      user: {
        id: newUser[0].id,
        email: newUser[0].email,
      },
      token
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user.length) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user[0].passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user[0].id, user[0].email);

    res.json({
      user: {
        id: user[0].id,
        email: user[0].email,
      },
      token
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production') as { userId: string };
    
    const user = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1);
    
    if (!user.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user[0].id,
        email: user[0].email,
      }
    });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;