import os
import re

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # More flexible pattern to match <td> with line-clamp-2 or truncate
    # Matches <td className="..." ... title="..." > ... </td>
    # or <td title="..." ... className="..." > ... </td>
    
    td_pattern = re.compile(r'<td\s+([^>]*className="[^"]*(line-clamp-2|truncate)[^"]*"[^>]*)>(.*?)</td>', re.DOTALL)
    
    def replacer(match):
        attrs = match.group(1)
        inner = match.group(3)
        
        # Don't wrap if it's already wrapped in a div with line-clamp-2
        if '<div' in inner and 'line-clamp-2' in inner:
            return match.group(0)
            
        # Extract title if present
        title_match = re.search(r'title="([^"]*)"', attrs)
        title = title_match.group(1) if title_match else ""
        
        # Extract className
        class_match = re.search(r'className="([^"]*)"', attrs)
        if not class_match: return match.group(0)
        classname = class_match.group(1)
        
        # New td classes: remove truncation and text styling that should move to div
        # Actually, let's just remove truncation.
        new_td_classname = classname.replace('line-clamp-2', '').replace('truncate', '').strip()
        new_td_classname = ' '.join(new_td_classname.split())
        
        # Build inner div classes
        text_classes = []
        for cls in ['text-sm', 'text-xs', 'font-medium', 'font-semibold', 'font-mono', 'text-gray-900', 'dark:text-white', 'text-gray-600', 'dark:text-gray-400', 'max-w-xs', 'font-bold']:
            if cls in classname:
                text_classes.append(cls)
        
        inner_div_classname = " ".join(text_classes + ["line-clamp-2"])
        
        # Rebuild attributes without title and with new className
        new_attrs = attrs.replace(f'className="{classname}"', f'className="{new_td_classname}"')
        if title_match:
            new_attrs = new_attrs.replace(title_match.group(0), "")
        new_attrs = ' '.join(new_attrs.split())
        
        title_attr = f' title="{title}"' if title else ""
        
        return f'<td {new_attrs}><div className="{inner_div_classname}"{title_attr}>{inner.strip()}</div></td>'

    new_content = td_pattern.sub(replacer, content)
    
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Fixed {filepath}")

for root, dirs, files in os.walk('app'):
    for file in files:
        if file.endswith('.tsx'):
            fix_file(os.path.join(root, file))
