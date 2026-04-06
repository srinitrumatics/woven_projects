const fs = require('fs');
const glob = require('glob'); // Not available by default, I'll use child_process or raw JS traversing

const targetFiles = [
"app/admin/authorize-locations/page.tsx",
"app/admin/authorize-locations/[id]/delivery-windows/page.tsx",
"app/inventory/page.tsx",
"app/inventory/[id]/page.tsx",
"app/invoices/page.tsx",
"app/invoices/[id]/lines/[lineid]/page.tsx",
"app/invoices/[id]/page.tsx",
"app/orders/page.tsx",
"app/orders/[id]/lines/[lineId]/page.tsx",
"app/orders/[id]/page.tsx",
"app/proposals/page.tsx",
"app/proposals/[id]/lines/[lineid]/page.tsx",
"app/proposals/[id]/page.tsx",
"app/purchase-orders/page.tsx",
"app/purchase-orders/[id]/components/POFilesTable.tsx",
"app/purchase-orders/[id]/lines/[lineid]/page.tsx",
"app/purchase-orders/[id]/page.tsx",
"app/quotes/page.tsx",
"app/quotes/[id]/lines/[lineid]/page.tsx",
"app/quotes/[id]/page.tsx",
"app/shipments/page.tsx",
"app/shipments/[id]/lines/[lineid]/page.tsx",
"app/shipments/[id]/page.tsx",
"app/supplier-bills/page.tsx",
"app/supplier-bills/[id]/components/SupplierBillFilesTable.tsx",
"app/supplier-bills/[id]/lines/[lineid]/components/SBLFilesTab.tsx",
"app/supplier-bills/[id]/lines/[lineid]/page.tsx",
"app/supplier-bills/[id]/page.tsx",
];

for (const file of targetFiles) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf-8');
  
  if (content.includes("process.env.NEXT_PUBLIC_SALESFORCE_ACCOUNT_ID")) {
    // Add import if missing
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
    
    // Replace declarations
    const accountRegex = /^[^\n]*const SF_ACCOUNT_ID = process\.env\.NEXT_PUBLIC_SALESFORCE_ACCOUNT_ID.*?\n/m;
    const contactRegex = /^[^\n]*const SF_CONTACT_ID = process\.env\.NEXT_PUBLIC_SALESFORCE_CONTACT_ID.*?\n/m;
    
    // We only want to declare `const { user, selectedAccount } = useUserSession();` once per component
    // If it's not already in the file, we can inject it right before SF_ACCOUNT_ID
    
    let replacement = '';
    if (!content.includes('{ user, selectedAccount } = useUserSession()') && !content.includes('{ selectedAccount, user } = useUserSession()')) {
        replacement += '  const { user, selectedAccount } = useUserSession();\n';
    }
    
    replacement += '  const SF_ACCOUNT_ID = selectedAccount?.Id || selectedAccount?.id || "";\n';
    // wait is contact fetched nicely? let's just do it
    replacement += '  const SF_CONTACT_ID = user?.contact?.Id || user?.contact?.id || "";\n';

    // The code structure usually has:
    // const SF_ACCOUNT_ID = ...
    // const SF_CONTACT_ID = ... // maybe with comments
    
    // Let's replace line by line
    let lines = content.split('\n');
    let outLines = [];
    let addedHook = false;
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        if (line.includes("const SF_ACCOUNT_ID =") && line.includes("process.env.NEXT_PUBLIC")) {
            if (!addedHook) {
                if (!content.includes('useUserSession()')) {
                    outLines.push('  const { user, selectedAccount } = useUserSession();');
                }
                addedHook = true;
            }
            outLines.push('  const SF_ACCOUNT_ID = selectedAccount?.Id || selectedAccount?.id || "";');
        } else if (line.includes("const SF_CONTACT_ID =") && line.includes("process.env.NEXT_PUBLIC")) {
            outLines.push('  const SF_CONTACT_ID = user?.contact?.Id || user?.contact?.id || "";');
        } else {
            outLines.push(line);
        }
    }
    
    fs.writeFileSync(file, outLines.join('\n'));
    console.log("Updated", file);
  }
}
