/**
 * @file index.ts
 * @description Barrel export for all shared TypeScript type definitions.
 * @module types
 */

export * from './batch-generation.types';
export * from './dailyWord';
export * from './dashboard.types';
export * from './passion.types';
export * from './settings.types';
export * from './templates';

// community.ts and feed.ts both export `Profile` — use aliased re-exports to avoid collision
export type {
  Profile as CommunityProfile,
  GroupChat,
  Conversation,
  Message,
  Reaction,
} from './community';
export { JUDE_USER_ID } from './community';

export type {
  Profile as FeedProfile,
  Comment as FeedComment,
  Post as FeedPost,
} from './feed';
