/**
 * @file index.ts
 * @description Barrel export for all React contexts — named exports only.
 * @module contexts
 */

export { ContentEditorPermissionsProvider, useContentEditorPermissionsContext } from './ContentEditorPermissionsContext';
export type { ContentEditorRole } from './ContentEditorPermissionsContext';

export { FirstTimeUserProvider, useFirstTimeUser } from './FirstTimeUserContext';

export { JudeAudioProvider, useJudeAudio } from './JudeAudioContext';

export { MusicPlayerProvider, useMusicPlayer } from './MusicPlayerContext';

export { NetworkProvider, useNetwork } from './NetworkContext';
export { default as NetworkContext } from './NetworkContext';

export { PresenceProvider, usePresence, useUserPresence, useOnlineUserIds, JUDE_USER_ID } from './PresenceContext';

export { SessionAuthProvider, useSessionAuth } from './SessionAuthContext';

export { StreakProvider, useStreak } from './StreakContext';
export type { MilestoneData } from './StreakContext';

export { VisitorProvider, useVisitor } from './VisitorContext';
export type { VisitorType } from './VisitorContext';
