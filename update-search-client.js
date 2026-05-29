const fs = require('fs');
let content = fs.readFileSync('app/search/SearchClientPage.tsx', 'utf8');

content = content.replace(/const indexName = process\.env\.NEXT_PUBLIC_ALGOLIA_INDEX_NAME \|\| "movies_index";/, '');

content = content.replace(/export default function SearchPage\(\) \{/, 
`export default function SearchClientPage({ indexName = "movies_index" }: { indexName?: string }) {`);

fs.writeFileSync('app/search/SearchClientPage.tsx', content);
