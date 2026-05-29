const fs = require('fs');
let content = fs.readFileSync('app/products/ProductClientPage.tsx', 'utf8');

// Modify Content to take indexName as prop
content = content.replace(/function Content\(\) \{[\s\S]*?const indexName = process\.env\.NEXT_PUBLIC_ALGOLIA_INDEX_NAME \|\| "wovn_products_local";/, 
`function Content({ indexName }: { indexName: string }) {`);

content = content.replace(/<Content \/>/, `<Content indexName={finalIndexName} />`);

content = content.replace(/export default function ProductClientPage\(\) \{[\s\S]*?const indexName = process\.env\.NEXT_PUBLIC_ALGOLIA_INDEX_NAME \|\| "wovn_products_local";/, 
`export default function ProductClientPage({ indexName }: { indexName?: string }) {
  const finalIndexName = indexName || process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || "wovn_products_local";`);

content = content.replace(/indexName=\{indexName\}/, `indexName={finalIndexName}`);

fs.writeFileSync('app/products/ProductClientPage.tsx', content);
