import { pgTable, text, boolean, integer, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// User profiles table
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  username: text('username').notNull().unique(),
  displayName: text('display_name'),
  bio: text('bio'),
  countryCode: text('country_code'),
  countryFlag: text('country_flag'),
  avatarUrl: text('avatar_url'),
  rank: text('rank').notNull().default('Iron 1'),
  roles: text('roles').array().notNull().default(sql`'{}'`),
  voiceChat: boolean('voice_chat').notNull().default(false),
  availability: text('availability').array().notNull().default(sql`'{}'`),
  age: integer('age'),
  isPremium: boolean('is_premium').notNull().default(false),
  lastActive: timestamp('last_active').defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Basic users table for authentication
export const users = pgTable('users', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  emailConfirmed: boolean('email_confirmed').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Matches table for user connections
export const matches = pgTable('matches', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  user1Id: uuid('user1_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  user2Id: uuid('user2_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  matchedAt: timestamp('matched_at').notNull().defaultNow(),
});

// Swipes table to track likes/passes
export const swipes = pgTable('swipes', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  swiperId: uuid('swiper_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  swipedId: uuid('swiped_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  isLike: boolean('is_like').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Messages table for chat
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  matchId: uuid('match_id').notNull().references(() => matches.id, { onDelete: 'cascade' }),
  senderId: uuid('sender_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Export types for use in the application
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type Match = typeof matches.$inferSelect;
export type NewMatch = typeof matches.$inferInsert;
export type Swipe = typeof swipes.$inferSelect;
export type NewSwipe = typeof swipes.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;