import re

with open('prisma/schema.prisma', 'r', encoding='utf-8') as f:
    content = f.read()

# Check current state
if 'salesperson' in content:
    # It may be garbled - fix it
    # Replace garbled line with proper multiline
    content = re.sub(
        r'printer\s+String\?.*?additionalNotes\s+String\?',
        'printer         String?\n  salesperson     String?\n  additionalNotes String?',
        content,
        flags=re.DOTALL
    )
else:
    # Add salesperson after printer
    content = content.replace(
        '  printer         String?\n  additionalNotes String?',
        '  printer         String?\n  salesperson     String?\n  additionalNotes String?'
    )

with open('prisma/schema.prisma', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done. Checking result:')
for i, line in enumerate(content.split('\n')):
    if 'printer' in line or 'salesperson' in line or 'additionalNotes' in line:
        print(f'  Line {i+1}: {repr(line)}')
