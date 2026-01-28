import os
import re

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Pattern to find <td class="..." title="...">...</td> where class contains line-clamp-2 or truncate
    # We want to move line-clamp-2 and truncate and title to an inner div
    
    # Regex for <td ... class="... (line-clamp-2|truncate) ..." ... title="..." > ... </td>
    # This is tricky because order of attributes can vary and content can be complex.
    # Let's target the most common pattern I've seen.
    
    pattern = re.compile(r'<td\s+([^>]*className="([^"]*(?:line-clamp-2|truncate)[^"]*)"[^>]*title="([^"]*)"[^>]*)>(.*?)</td>', re.DOTALL)
    
    def replacer(match):
        attributes = match.group(1)
        classname = match.group(2)
        title = match.group(3)
        inner_content = match.group(4)
        
        # Remove line-clamp-2 and truncate from classname
        new_td_classname = classname.replace('line-clamp-2', '').replace('truncate', '').strip()
        # Clean up double spaces
        new_td_classname = ' '.join(new_td_classname.split())
        
        # Check if internal content already has a div with line-clamp-2
        if 'line-clamp-2' in inner_content and '<div' in inner_content:
             # Already partially fixed or complex? Let's be careful.
             return match.group(0)

        # Reconstruct td attributes without line-clamp-2/truncate/title
        new_attributes = attributes.replace(f'className="{classname}"', f'className="{new_td_classname}"')
        new_attributes = new_attributes.replace(f'title="{title}"', '').strip()
        new_attributes = ' '.join(new_attributes.split())
        
        # Build inner div classes
        # If it was truncate, we change it to line-clamp-2
        inner_classname = "line-clamp-2"
        # If there were other classes on the td like text-sm that should be on the text, maybe move them?
        # For now, let's keep it simple.
        
        # We also need to preserve text-specific classes if they were on the td
        text_classes = []
        for cls in ['text-sm', 'text-xs', 'font-medium', 'font-semibold', 'font-mono', 'text-gray-900', 'dark:text-white', 'text-gray-600', 'dark:text-gray-400', 'max-w-xs']:
             if cls in classname:
                  text_classes.append(cls)
        
        inner_div_classname = " ".join(text_classes + ["line-clamp-2"])
        
        return f'<td {new_attributes}><div className="{inner_div_classname}" title="{title}">{inner_content.strip()}</div></td>'

    new_content = pattern.sub(replacer, content)
    
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Fixed {filepath}")

for root, dirs, files in os.walk('app'):
    for file in files:
        if file.endswith('.tsx'):
            fix_file(os.path.join(root, file))
