import express from 'express';
import { db } from '../db.js';
import { messages, matches, profiles } from '../../shared/schema.js';
import { eq, or, and, desc } from 'drizzle-orm';
import { AuthenticatedRequest } from '../middleware/auth.js';

const router = express.Router();

// Get messages for a specific match
router.get('/:matchId', async (req: AuthenticatedRequest, res) => {
  try {
    const { matchId } = req.params;

    // Verify user is part of this match
    const match = await db.select()
      .from(matches)
      .where(and(
        eq(matches.id, matchId),
        or(
          eq(matches.user1Id, req.user!.id),
          eq(matches.user2Id, req.user!.id)
        )
      ))
      .limit(1);

    if (!match.length) {
      return res.status(403).json({ error: 'Access denied to this match' });
    }

    // Get messages
    const matchMessages = await db.select()
      .from(messages)
      .where(eq(messages.matchId, matchId))
      .orderBy(messages.createdAt);

    res.json(matchMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a message
router.post('/:matchId', async (req: AuthenticatedRequest, res) => {
  try {
    const { matchId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Verify user is part of this match
    const match = await db.select()
      .from(matches)
      .where(and(
        eq(matches.id, matchId),
        or(
          eq(matches.user1Id, req.user!.id),
          eq(matches.user2Id, req.user!.id)
        )
      ))
      .limit(1);

    if (!match.length) {
      return res.status(403).json({ error: 'Access denied to this match' });
    }

    // Create message
    const newMessage = await db.insert(messages).values({
      matchId,
      senderId: req.user!.id,
      content: content.trim()
    }).returning();

    res.status(201).json(newMessage[0]);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get match details with other user's profile
router.get('/:matchId/details', async (req: AuthenticatedRequest, res) => {
  try {
    const { matchId } = req.params;

    // Get match and verify user access
    const match = await db.select()
      .from(matches)
      .where(and(
        eq(matches.id, matchId),
        or(
          eq(matches.user1Id, req.user!.id),
          eq(matches.user2Id, req.user!.id)
        )
      ))
      .limit(1);

    if (!match.length) {
      return res.status(403).json({ error: 'Access denied to this match' });
    }

    // Get other user's profile
    const otherUserId = match[0].user1Id === req.user!.id ? match[0].user2Id : match[0].user1Id;
    const profile = await db.select()
      .from(profiles)
      .where(eq(profiles.userId, otherUserId))
      .limit(1);

    res.json({
      match: match[0],
      otherUserProfile: profile[0] || null
    });
  } catch (error) {
    console.error('Error fetching match details:', error);
    res.status(500).json({ error: 'Failed to fetch match details' });
  }
});

export default router;