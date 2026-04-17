import os, re

files = [
    'app/dashboard/purchases/page.tsx',
    'components/dashboard/AdminAnalytics.tsx',
    'components/invoices/AdvancedFilterPanel.tsx',
    'components/accounts/ExpensesTable.tsx',
    'components/dashboard/PerformanceCharts.tsx',
    'components/accounts/CounterBalanceHero.tsx',
    'components/accounts/ReceivablesTable.tsx',
    'components/accounts/TransactionLedger.tsx'
]

import_statement = 'import { CustomDateInput } from "@/components/ui/custom-date-input";\n'

for file_path in files:
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        original_content = content
        
        # We need to replace exactly `<input type="date"` and `<input type='date'`
        # considering there might be spaces/newlines before type
        content = re.sub(r'<input\s+type=[\"\']date[\"\']', '<CustomDateInput', content)
        
        if content != original_content and 'CustomDateInput' not in original_content:
            # Find the last import statement
            imports = list(re.finditer(r'^import .*?;?\n', content, flags=re.MULTILINE))
            if imports:
                last_import = imports[-1]
                insert_pos = last_import.end()
                content = content[:insert_pos] + import_statement + content[insert_pos:]
            else:
                # No imports found, just prepend
                content = import_statement + '\n' + content
                
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f'Updated {file_path}')
        elif content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f'Updated {file_path} (import already existed)')

