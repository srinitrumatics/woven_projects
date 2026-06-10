const fs = require('fs');
const path = require('path');

const directoryPath = '/media/trumatics/New Volume/wovn/woven_projects-main/app';

function walkDir(dir, callback) {
    console.log("[Function Start] check-tooltips.js -> walkDir");
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

function checkFile(filePath) {
    console.log("[Function Start] check-tooltips.js -> checkFile");
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.js') && !filePath.endsWith('.ts')) return;

    const content = fs.readFileSync(filePath, 'utf8');

    // Regex to find title attribute and the text inside the tag
    // Match pattern: <Tag ... title="TITLE">TEXT</Tag> or <Tag ... title={TITLE}>TEXT</Tag>
    // This is a simplified regex and won't catch everything (like nested tags), but it's a good start.
    const regex = /<(\w+)[^>]*title=(?:"([^"]+)"|{([^}]+)})[^>]*>([^<]+)<\/\1>/g;

    let match;
    while ((match = regex.exec(content)) !== null) {
        const tag = match[1];
        const titleQuoted = match[2];
        const titleBraced = match[3];
        const text = match[4].trim();
        const title = (titleQuoted || titleBraced || '').trim();

        if (title && text && title !== text) {
            // Exclude some common patterns that are likely intentional
            if (title.includes('.') || title.includes('{') || text.includes('{')) continue;
            if (title === "Notes" && text === "Shipment Notes") {
                continue;
            }
        }
    }
}

walkDir(directoryPath, checkFile);
