const fs = require('fs');
const path = require('path');

const directoryPath = '/media/trumatics/New Volume/wovn/woven_projects-main/app';

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

function checkFile(filePath) {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.js') && !filePath.endsWith('.ts')) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Pattern: title="OLD" text="NEW"
    // Pattern for static text
    const regex = /<(\w+)([^>]*?)\btitle="([^"]+)"([^>]*?)>([^<]+)<\/\1>/g;
    
    let match;
    let foundDiscrepancies = false;
    
    while ((match = regex.exec(content)) !== null) {
        const tag = match[1];
        const attrPre = match[2];
        const title = match[3].trim();
        const attrPost = match[4];
        const text = match[5].trim();

        if (title && text && title !== text) {
            // Exclude common dynamic or special cases
            if (title.includes('{') || text.includes('{') || text.includes('$')) continue;
            
            console.log(`[FIXING] ${filePath}: "${title}" -> "${text}"`);
            
            // Construct replacement
            const oldTag = match[0];
            const newTag = `<${tag}${attrPre}title="${text}"${attrPost}>${match[5]}</${tag}>`;
            
            content = content.replace(oldTag, newTag);
            foundDiscrepancies = true;
        }
    }

    if (foundDiscrepancies) {
        fs.writeFileSync(filePath, content);
    }
}

walkDir(directoryPath, checkFile);
console.log("Cleanup complete.");
