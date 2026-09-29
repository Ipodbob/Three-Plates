// Read-only triage. A match is a review candidate, never an automatic correction.
const path = require('node:path');
for (const file of ['recipes', 'batch-v3', 'recipes-rated', 'recipes-diverse', 'recipes-expanded', 'recipes-specialists', 'catalogue-review']) {
  require(path.join(__dirname, '..', file + '.js'));
}
const register = require('../docs/catalogue/quantity-review-queue.json');
const candidates = PLATES_DATA.recipes.filter(r => /amounts are not included:[^.]*\bplus\s+(?:\d|half|one|two)/i.test(r.planningNotes || ''));
const unregistered = candidates.filter(r => !register.entries.some(e => e.recipeId === r.id));
const pending = register.entries.filter(e => e.status === 'pending');
console.log(JSON.stringify({
  scope: register.scope,
  candidateCount: candidates.length,
  pendingCount: pending.length,
  pending: pending.map(e => ({ recipeId: e.recipeId, source: e.source })),
  unregistered: unregistered.map(r => ({ recipeId: r.id, source: r.source?.url })),
}, null, 2));
if (unregistered.length) process.exitCode = 1;
