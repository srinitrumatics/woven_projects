const fs = require('fs');

const targetFiles = [
"app/shipments/page.tsx",
"app/orders/page.tsx",
"app/admin/authorize-locations/page.tsx",
"app/admin/authorize-locations/[id]/delivery-windows/page.tsx",
"app/inventory/page.tsx",
"app/inventory/[id]/page.tsx",
];

for (const file of targetFiles) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf-8');
  
  if (content.includes("process.env.NEXT_PUBLIC_SALESFORCE_ACCOUNT_ID")) {
    if (!content.includes("useUserSession")) {
      const importRegex = /import .* from ['"].*['"];?\n/g;
      let lastMatch;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        lastMatch = match;
      }
      
      if (lastMatch) {
        const importIndex = lastMatch.index + lastMatch[0].length;
        content = content.slice(0, importIndex) + 'import { useUserSession } from "@/components/UserSessionContext";\n' + content.slice(importIndex);
      } else {
        content = 'import { useUserSession } from "@/components/UserSessionContext";\n' + content;
      }
    }
    
    let lines = content.split('\n');
    let outLines = [];
    let addedHook = false;
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        if (line.includes("process.env.NEXT_PUBLIC_SALESFORCE_ACCOUNT_ID")) {
            if (!addedHook && !content.includes('useUserSession()')) {
                outLines.push('  const { user, selectedAccount } = useUserSession();');
                addedHook = true;
            }
            
            // Extract the variable name
            const match = line.match(/const\s+(\w+)\s*=/);
            let varName = match ? match[1] : "accountId";
            
            outLines.push(`  const ${varName} = selectedAccount?.Id || selectedAccount?.id || "";`);
        } else if (line.includes("process.env.NEXT_PUBLIC_SALESFORCE_CONTACT_ID")) {
            // Extract the variable name
            const match = line.match(/const\s+(\w+)\s*=/);
            let varName = match ? match[1] : "contactId";
            
            outLines.push(`  const ${varName} = user?.contact?.Id || user?.contact?.id || "";`);
        } else {
            outLines.push(line);
        }
    }
    
    fs.writeFileSync(file, outLines.join('\n'));
    console.log("Updated edge case", file);
  }
}
