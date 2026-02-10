/**
 * Shared Bazik.io utilities for MonCash payment functions.
 * Centralizes authentication and credential management.
 */

export const BAZIK_API_BASE = 'https://api.bazik.io';

/**
 * Returns MonCash/Bazik credentials based on the current mode.
 */
export function getMonCashCredentials(): {
  mode: string;
  userID: string | undefined;
  secretKey: string | undefined;
} {
  const mode = Deno.env.get('MONCASH_MODE') || 'sandbox';
  const userID = mode === 'sandbox'
    ? Deno.env.get('MONCASH_SANDBOX_CLIENT_ID')
    : Deno.env.get('MONCASH_CLIENT_ID');
  const secretKey = mode === 'sandbox'
    ? Deno.env.get('MONCASH_SANDBOX_SECRET_KEY')
    : Deno.env.get('MONCASH_SECRET_KEY');

  return { mode, userID, secretKey };
}

/**
 * Authenticates with Bazik.io and returns an access token.
 */
export async function getBazikToken(userID: string, secretKey: string): Promise<string> {
  const response = await fetch(`${BAZIK_API_BASE}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ userID, secretKey }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Bazik auth error:', response.status, errorText);
    throw new Error(`Failed to authenticate with Bazik.io: ${response.status}`);
  }

  const data = await response.json();
  const accessToken = data.access_token || data.token;

  if (!accessToken) {
    throw new Error('No access token received from Bazik.io');
  }

  return accessToken;
}
