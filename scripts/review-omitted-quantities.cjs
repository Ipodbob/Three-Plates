// Read-only triage, not an ingredient parser or proof of a missing ingredient.
const path = require('node:path');
for (const file of ['recipes','batch-v3','recipes-rated','recipes-diverse','recipes-expanded','recipes-specialists','catalogue-review'])
  require(path.join(__dirname,'..',file+'.js'));
function candidates() {
  return PLATES_DATA.recipes.flatMap(r => {
    const match=(r.planningNotes||'').match(/Not included in shopping \(serving extras, optional items or equipment\): (.*?)(?: Ingredient alternatives| Catalogue correction|$)/);
    if (!match) return [];
    const lines=match[1].replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(+n)).replace(/&nbsp;/g,' ').split(';').map(x=>x.trim()).filter(x=>
      /^(?:for topping:\s*)?(?:heaping\s*)?[0-9¼½¾⅓⅔]/i.test(x) &&
      !/optional|to serve|for serving|for garn|for greas|for dust|decorat|skewers|toothpicks|if desired/i.test(x) &&
      (!/\bwater\b/i.test(x) || /cornstarch|cocoa|butter|flour|milk/i.test(x)));
    return lines.length ? [{recipeId:r.id,source:r.source?.url,lines}] : [];
  });
}
module.exports=candidates;
if(require.main===module) {
  const register=require('../docs/catalogue/omitted-quantity-review.json');
  const rows=candidates(), unregistered=rows.filter(r=>!register.entries.some(e=>e.recipeId===r.recipeId));
  console.log(JSON.stringify({scope:register.scope,candidateCount:rows.length,pending:register.entries.filter(e=>e.status==='pending').map(e=>e.recipeId),unregistered},null,2));
  if(unregistered.length)process.exitCode=1;
}
