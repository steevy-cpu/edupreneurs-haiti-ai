// Bound auth work on slow connections without letting late results update the page.
export const OAUTH_REQUEST_TIMEOUT_MS = 10_000;

export async function oauthRequest<T>(request: () => Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      Promise.resolve().then(request),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('La demande prend trop de temps. Réessaie.')), OAUTH_REQUEST_TIMEOUT_MS);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}