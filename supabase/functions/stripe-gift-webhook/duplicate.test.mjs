// Run with: node --test supabase/functions/stripe-gift-webhook/duplicate.test.mjs  (Node 22.18+ / 24; no Deno or install needed)
// Loads the Deno handler as-is, with its remote imports and Deno.env stubbed.
import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'

const stubs = {
  'https://deno.land/std@0.190.0/http/server.ts': 'export const serve = (h) => { globalThis.__handler = h }',
  'https://esm.sh/stripe@18.5.0': 'export default class Stripe { webhooks = { constructEventAsync: async (body) => JSON.parse(body) } }',
  'npm:@supabase/supabase-js@2.57.2': 'export const createClient = () => globalThis.__db',
  '../_shared/emails.ts': 'export const sendEmail = async () => {}; export const buildRenewalStudentEmail = () => ""; export const buildRenewalPayerEmail = () => ""',
}
registerHooks({
  resolve(spec, ctx, next) {
    return stubs[spec] ? { url: 'stub:' + spec, shortCircuit: true } : next(spec, ctx)
  },
  load(url, ctx, next) {
    return url.startsWith('stub:')
      ? { format: 'module', source: stubs[url.slice(5)], shortCircuit: true }
      : next(url, ctx)
  },
})
const env = { STRIPE_SECRET_KEY: 'sk_test', STRIPE_WEBHOOK_SECRET_GIFT: 'whsec_test', SUPABASE_URL: 'http://localhost', SUPABASE_SERVICE_ROLE_KEY: 'k' }
globalThis.Deno = { env: { get: (k) => env[k] } }
globalThis.fetch = async () => ({ ok: true })
await import('./index.ts')

// In-memory stand-in for the tables the renewal path touches. The renewal ledger enforces its
// primary key the way Postgres does, if the handler writes to one.
let db
function makeDb() {
  const query = (table, rows) => {
    const f = []
    let patch = null
    const run = () => rows.filter((r) => f.every(([c, v]) => r[c] === v))
    const q = {
      select: () => q,
      eq: (c, v) => (f.push([c, v]), q),
      maybeSingle: async () => ({ data: run()[0] ?? null, error: null }),
      update: (p) => ((patch = p), q),
      then(res, rej) {
        if (patch) run().forEach((r) => Object.assign(r, patch))
        return Promise.resolve({ error: null }).then(res, rej)
      },
    }
    return q
  }
  return {
    from(table) {
      if (table === 'gift_renewal_invoices') {
        return {
          async insert(row) {
            if (db.ledger.some((r) => r.invoice_id === row.invoice_id)) return { error: { code: '23505' } }
            db.ledger.push(row)
            return { error: null }
          },
          delete: () => ({ eq: async () => ({ error: null }) }),
        }
      }
      if (table === 'notifications') return { insert: async () => ({ error: null }) }
      return query(table, db[table])
    },
    auth: { admin: { listUsers: async () => ({ data: { users: [] } }) } },
  }
}

beforeEach(() => {
  db = {
    ledger: [],
    gift_subscriptions: [{ id: 'g1', stripe_subscription_id: 'sub_1', student_user_id: 'u1', student_email: 's@x.test', student_name: 'S', payer_email: null }],
    profiles: [{ user_id: 'u1', subscription_status: 'active', subscription_end_date: '2030-01-01T00:00:00.000Z' }],
  }
  globalThis.__db = makeDb()
})

function renewal(eventId, invoiceId) {
  const event = { id: eventId, type: 'invoice.paid', data: { object: { id: invoiceId, subscription: 'sub_1', billing_reason: 'subscription_cycle', amount_paid: 200, customer_email: null } } }
  return globalThis.__handler(new Request('http://localhost/', { method: 'POST', headers: { 'stripe-signature': 't=1,v1=x' }, body: JSON.stringify(event) }))
}

test('a redelivered invoice.paid extends access only once', async () => {
  await renewal('evt_1', 'in_1')
  const afterFirst = db.profiles[0].subscription_end_date
  await renewal('evt_1', 'in_1') // Stripe delivers the same event again
  assert.equal(db.profiles[0].subscription_end_date, afterFirst)
})

test('a different invoice still extends access', async () => {
  await renewal('evt_1', 'in_1')
  const afterFirst = db.profiles[0].subscription_end_date
  await renewal('evt_2', 'in_2')
  assert.ok(new Date(db.profiles[0].subscription_end_date) > new Date(afterFirst))
})
