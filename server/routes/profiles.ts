import express from 'express';
import { db } from '../db.js';
import { profiles, users } from '../../shared/schema.js';
import { eq, ne } from 'drizzle-orm';
import { AuthenticatedRequest } from '../middleware/auth.js';

const router = express.Router();

// Get current user's profile
router.get('/me', async (req: AuthenticatedRequest, res) => {
  try {
    const profile = await db.select().from(profiles).where(eq(profiles.userId, req.user!.id)).limit(1);
    
    if (!profile.length) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profile[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update current user's profile
router.put('/me', async (req: AuthenticatedRequest, res) => {
  try {
    const {
      displayName,
      bio,
      countryCode,
      countryFlag,
      rank,
      roles,
      voiceChat,
      availability,
      age,
      avatarUrl
    } = req.body;

    const updatedProfile = await db.update(profiles)
      .set({
        displayName,
        bio,
        countryCode,
        countryFlag,
        rank,
        roles,
        voiceChat,
        availability,
        age,
        avatarUrl,
        lastActive: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(profiles.userId, req.user!.id))
      .returning();

    if (!updatedProfile.length) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(updatedProfile[0]);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get profiles for swiping (exclude current user and already swiped users)
router.get('/swipe', async (req: AuthenticatedRequest, res) => {
  try {
    // For now, get all profiles except current user
    // TODO: Add logic to exclude already swiped users
    const otherProfiles = await db.select()
      .from(profiles)
      .where(ne(profiles.userId, req.user!.id))
      .limit(10);

    res.json(otherProfiles);
  } catch (error) {
    console.error('Error fetching profiles for swiping:', error);
    res.status(500).json({ error: 'Failed to fetch profiles' });
  }
});

// Get profile by user ID
router.get('/:userId', async (req: AuthenticatedRequest, res) => {
  try {
    const { userId } = req.params;
    
    const profile = await db.select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);

    if (!profile.length) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profile[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

export default router;