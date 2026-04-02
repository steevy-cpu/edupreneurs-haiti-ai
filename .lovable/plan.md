
Objectif: expliquer pourquoi la requête DB des stats homepage échoue “à chaque fois”, sans modifier le code.

Constat principal
- Le problème n’est probablement pas la DB elle-même.
- Le vrai problème est un conflit entre:
  1. le hook homepage qui interroge des tables directement côté client avant authentification,
  2. les règles RLS existantes qui bloquent ces lectures en public,
  3. un `Promise.all(...)` qui fait échouer tout le bloc dès qu’une seule requête est refusée.

Où ça se passe
- `src/pages/Index.tsx:51`
  - `const { stats, isLoaded } = useDeferredStats();`
- `src/hooks/useDeferredStats.ts:40-46`
  - le hook lance 3 requêtes en parallèle:
```ts
const [lessonsRes, examsRes, usersRes] = await Promise.all([
  supabase.from('lessons').select('id', { count: 'exact', head: true }).eq('is_published', true),
  supabase.from('official_exams').select('id', { count: 'exact', head: true }),
  supabase.from('profiles').select('id', { count: 'exact', head: true }).or('is_system_account.is.null,is_system_account.eq.false')
]);
```

Pourquoi ça casse
1. Homepage chargée en visiteur / anon
- La homepage appelle `useDeferredStats()` directement sur `/`.
- Donc ces requêtes partent avec le client public, pas avec un utilisateur connecté.

2. `lessons` est explicitement bloqué pour les visiteurs
- Politique trouvée:
  - `supabase/migrations/20251022205423_fc002606-ffdc-4455-902c-53c835f1e4bd.sql:133-136`
```sql
CREATE POLICY "Everyone can view published lessons"
ON public.lessons FOR SELECT
TO authenticated
USING (is_published = true OR public.is_content_editor(auth.uid(), 'viewer'));
```
- Le nom dit “Everyone”, mais techniquement c’est `TO authenticated`.
- Donc un visiteur anonyme ne peut pas lire `lessons`.

3. `profiles` n’est pas ouvert en lecture publique directe
- RLS activé:
  - `supabase/migrations/20251003121305_0dac2475-8b36-4c55-b8d4-c949a37743c2.sql:17`
- Politique actuelle pertinente:
  - `supabase/migrations/20260109121724_3ad33fdf-4b05-4d39-9f5f-885ad5f9d50a.sql:19-43`
```sql
CREATE POLICY "Authenticated users can view profiles for social features" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  auth.uid() = user_id 
  OR EXISTS (...)
  OR (is_system_account IS NULL OR is_system_account = false)
);
```
- Là encore: `TO authenticated`.
- Donc la homepage publique ne peut pas faire `select count(*)` directement sur `profiles`.

4. `official_exams` semble OK, mais ça ne suffit pas
- Politique:
  - `supabase/migrations/20251128135527_83c4f0b2-179b-46ce-8030-b1bb02ee5d62.sql:61-64`
```sql
CREATE POLICY "Everyone can view published exams"
  ON public.official_exams FOR SELECT
  USING (true);
```
- Celle-ci est lisible publiquement.
- Mais comme les 3 requêtes sont dans `Promise.all`, si `lessons` ou `profiles` échoue en RLS, tout le fetch tombe dans le `catch`.

Pourquoi tu vois toujours le fallback
- `src/hooks/useDeferredStats.ts:48-49`
```ts
if (lessonsRes.error || examsRes.error || usersRes.error) {
  throw new Error('Failed to fetch stats');
}
```
- puis:
  - `src/hooks/useDeferredStats.ts:61-64`
```ts
console.error('Error fetching stats:', err);
setError(err instanceof Error ? err : new Error('Unknown error'));
// Keep default stats on error - don't show broken UI
setIsLoaded(true);
```
- Résultat: dès qu’une seule table est refusée par RLS, la homepage reste sur `DEFAULT_STATS`.

Diagnostic le plus probable
- La requête “Étudiants” échoue parce que `profiles` est interrogée directement depuis le client public alors que la lecture de cette table est limitée aux utilisateurs authentifiés.
- Et même si tu corriges juste `profiles`, le compteur global peut continuer à “échouer” tant que `lessons` reste aussi bloqué pour les visiteurs.

Approche recommandée
1. Ne pas compter `profiles` directement depuis la homepage publique.
2. Utiliser une source publique sûre:
   - soit une vue publique déjà pensée pour ça,
   - soit une fonction SQL sécurisée / RPC qui renvoie seulement les agrégats,
   - soit une vue/stat table dédiée aux compteurs publics.
3. Éviter qu’un seul échec casse tout:
   - découpler les 3 compteurs,
   - ou faire une seule RPC backend qui renvoie les 3 chiffres d’un coup.

Option la plus propre pour ce projet
- Créer un endpoint backend public très limité qui renvoie uniquement:
  - published lessons count
  - official exams count
  - non-system student count
- Puis la homepage appelle ce point unique au lieu de lire `lessons` et `profiles` directement.

Safety verification

| Check | Verdict | Why |
|---|---|---|
| Conflit RLS identifié | Oui | `lessons` et `profiles` sont limités à `authenticated` |
| Problème DB réel probable | Non | les règles d’accès expliquent l’échec |
| Risque PII si on “ouvre profiles” | Oui | il ne faut pas rendre `profiles` public juste pour un compteur |
| Cause du fallback identifiée | Oui | `Promise.all` + `throw` global |
| Compatible 3G | Oui | une seule réponse agrégée serait même meilleure |

Plan d’implémentation proposé
1. Remplacer les lectures directes de `lessons` et `profiles` dans `useDeferredStats` par une source publique agrégée.
2. Garder `official_exams` dans la même source agrégée pour unifier le comportement.
3. Faire retourner un objet unique `{ lessons, exams, users }`.
4. Conserver `DEFAULT_STATS` seulement comme secours visuel, pas comme source normale.
5. Optionnel mais recommandé: si une stat échoue, ne pas annuler les autres.

Conclusion
- La “DB fail everytime” vient surtout d’un problème d’accès public/RLS, pas d’une panne de base.
- Sur la homepage publique, votre code essaie de lire des tables qui exigent un utilisateur authentifié.
- Donc la requête échoue, puis le hook retombe systématiquement sur les valeurs hardcodées.
