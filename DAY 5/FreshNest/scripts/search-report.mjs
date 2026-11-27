// Prints what the search returns for a list of queries. Usage: node scripts/search-report.mjs "egg" "milk" ...
import { runSearch, suggest } from '../src/lib/search.js';
const qs = process.argv.slice(2);
for (const q of qs) {
  const r = runSearch(q);
  console.log(`\n"${q}" → ${r.results.length} result(s)${r.corrected ? `  [corrected to "${r.display}"]` : ''}${r.relaxed ? '  [relaxed]' : ''}`);
  r.results.slice(0, 14).forEach(x => console.log(`   ${String(Math.round(x.score)).padStart(5)} ${x.cls.padEnd(5)} ${x.p.name}  ·  ${x.p.brand}  ·  ${x.p.category}`));
  if (r.results.length > 14) console.log(`   … +${r.results.length - 14} more`);
}
