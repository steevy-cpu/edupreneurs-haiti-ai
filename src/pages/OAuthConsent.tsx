/**
 * OAuthConsent — approval screen for external OAuth clients (MCP agents).
 *
 * Supabase redirects here as /.lovable/oauth/consent?authorization_id=...
 * The page is public: unauthenticated visitors are sent to login with the FULL
 * consent URL preserved, so the agent connection can complete after sign-in.
 */

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldCheck } from 'lucide-react';

// Minimal local typing: supabase.auth.oauth is still beta and absent from generated types.
type OAuthNamespace = {
  getAuthorizationDetails: (id: string) => Promise<{ data: any; error: any }>;
  approveAuthorization: (id: string) => Promise<{ data: any; error: any }>;
  denyAuthorization: (id: string) => Promise<{ data: any; error: any }>;
};
const oauthApi = () => (supabase.auth as unknown as { oauth: OAuthNamespace }).oauth;

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get('authorization_id') ?? '';
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Identifiant d'autorisation manquant.");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        // Preserve the full consent URL so the user lands back here after login.
        const next = window.location.pathname + window.location.search;
        window.location.href = '/auth/login?next=' + encodeURIComponent(next);
        return;
      }
      const { data, error: detailsError } = await oauthApi().getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (detailsError) {
        setError(detailsError.message);
        return;
      }
      // Already-approved authorizations come back with an immediate redirect and no client info.
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    const { data, error: decideError } = approve
      ? await oauthApi().approveAuthorization(authorizationId)
      : await oauthApi().denyAuthorization(authorizationId);
    if (decideError) {
      setBusy(false);
      setError(decideError.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("Aucune redirection retournée par le serveur d'autorisation.");
      return;
    }
    window.location.href = target;
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm">
        {error ? (
          <>
            <h1 className="text-xl font-bold text-foreground mb-2">Connexion impossible</h1>
            <p className="text-sm text-muted-foreground">{error}</p>
          </>
        ) : !details ? (
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Chargement de la demande…</span>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-xl font-bold text-foreground">
                Connecter {details.client?.name ?? 'une application'}
              </h1>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Cette application pourra accéder à ton compte Edupreneurs en ton nom : ton profil,
              ta progression et les leçons auxquelles tu as accès. Tu peux refuser à tout moment.
            </p>
            <div className="flex gap-3">
              <Button className="flex-1" disabled={busy} onClick={() => decide(true)}>
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Autoriser
              </Button>
              <Button variant="outline" className="flex-1" disabled={busy} onClick={() => decide(false)}>
                Refuser
              </Button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
