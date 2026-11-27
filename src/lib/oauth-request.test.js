import { test, expect } from 'bun:test';
import { oauthRequest, OAUTH_REQUEST_TIMEOUT_MS } from './oauth-request';

test('OAuth loading is bounded to ten seconds', async () => {
  expect(OAUTH_REQUEST_TIMEOUT_MS).toBe(10_000);
  const original = globalThis.setTimeout;
  // Trigger the deadline immediately rather than slowing down the test suite.
  globalThis.setTimeout = (callback, delay) => original(callback, delay === 10_000 ? 0 : delay);
  try {
    await expect(oauthRequest(() => new Promise(() => {}))).rejects.toThrow('Réessaie');
  } finally {
    globalThis.setTimeout = original;
  }
});

test('OAuth provider exceptions reach the recoverable error state', async () => {
  await expect(oauthRequest(() => { throw new Error('Provider unavailable'); })).rejects.toThrow('Provider unavailable');
});

test('OAuth success preserves provider response', async () => {
  expect(await oauthRequest(async () => ({ redirect_url: 'https://claude.ai/callback' }))).toEqual({ redirect_url: 'https://claude.ai/callback' });
});