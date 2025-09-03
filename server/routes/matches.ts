import express from 'express';
import { db } from '../db.js';
import { matches, profiles, swipes, messages } from '../../shared/schema.js';
import { eq, or, and, desc } from 'drizzle-orm';
import { AuthenticatedRequest } from '../middleware/auth.js';

const router = express.Router();

// Get all matches for current user
router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const userMatches = await db.select()
      .from(matches)
      .where(or(
        eq(matches.user1Id, req.user!.id),
        eq(matches.user2Id, req.user!.id)
      ))
      .orderBy(desc(matches.matchedAt));

    // Get profiles and last messages for each match
    const matchesWithDetails = await Promise.all(
      userMatches.map(async (match) => {
        const otherUserId = match.user1Id === req.user!.id ? match.user2Id : match.user1Id;
        
        // Get other user's profile
        const profile = await db.select()
          .from(profiles)
          .where(eq(profiles.userId, otherUserId))
          .limit(1);

        // Get last message
        const lastMessage = await db.select()
          .from(messages)
          .where(eq(messages.matchId, match.id))
          .orderBy(desc(messages.createdAt))
          .limit(1);

        return {
          ...match,
          profile: profile[0] || null,
          lastMessage: lastMessage[0] || null
        };
      })
    );

    res.json(matchesWithDetails);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

// Create a swipe (like/pass)
router.post('/swipe', async (req: AuthenticatedRequest, res) => {
  try {
    const { swipedUserId, isLike } = req.body;

    if (!swipedUserId || typeof isLike !== 'boolean') {
      return res.status(400).json({ error: 'swipedUserId and isLike are required' });
    }

    // Check if already swiped
    const existingSwipe = await db.select()
      .from(swipes)
      .where(and(
        eq(swipes.swiperId, req.user!.id),
        eq(swipes.swipedId, swipedUserId)
      ))
      .limit(1);

    if (existingSwipe.length > 0) {
      return res.status(400).json({ error: 'Already swiped on this user' });
    }

    // Create swipe record
    await db.insert(swipes).values({
      swiperId: req.user!.id,
      swipedId: swipedUserId,
      isLike
    });

    let isMatch = false;

    // If it's a like, check for mutual like (match)
    if (isLike) {
      const mutualLike = await db.select()
        .from(swipes)
        .where(and(
          eq(swipes.swiperId, swipedUserId),
          eq(swipes.swipedId, req.user!.id),
          eq(swipes.isLike, true)
        ))
        .limit(1);

      if (mutualLike.length > 0) {
        // Create match
        const user1Id = req.user!.id < swipedUserId ? req.user!.id : swipedUserId;
        const user2Id = req.user!.id < swipedUserId ? swipedUserId : req.user!.id;

        await db.insert(matches).values({
          user1Id,
          user2Id
        });

        isMatch = true;
      }
    }

    res.json({ isMatch });
  } catch (error) {
    console.error('Error creating swipe:', error);
    res.status(500).json({ error: 'Failed to create swipe' });
  }
});

export default router;