import html
import re

md_path = '/Users/harshchavda/.gemini/antigravity/scratch/supplysense/PROJECT_DOCUMENTATION.md'
doc_path = '/Users/harshchavda/.gemini/antigravity/scratch/supplysense/PROJECT_DOCUMENTATION.doc'

with open(md_path, 'r', encoding='utf-8') as f:
    md_text = f.read()

lines = md_text.split('\n')
html_lines = []
in_table = False
table_html = []

for line in lines:
    if line.startswith('|'):
        if not in_table:
            in_table = True
            table_html = ['<table border="1" cellspacing="0" cellpadding="8" style="border-collapse:collapse; width:100%; font-size:11pt; margin-bottom:16px;">']
        if '---' in line:
            continue
        cells = [c.strip() for c in line.split('|')[1:-1]]
        is_header = len(table_html) == 1
        tag = 'th' if is_header else 'td'
        style = 'background-color:#0F172A; color:#FFFFFF; font-weight:bold;' if is_header else 'background-color:#F8FAFC;'
        row_str = '<tr>' + ''.join([f'<{tag} style="{style}">{html.escape(c)}</{tag}>' for c in cells]) + '</tr>'
        table_html.append(row_str)
    else:
        if in_table:
            in_table = False
            table_html.append('</table>')
            html_lines.append('\n'.join(table_html))
            table_html = []
        
        line_str = line.strip()
        if line_str.startswith('# '):
            html_lines.append(f'<h1 style="color:#1E3A8A; font-family:Calibri, sans-serif; font-size:24pt; border-bottom:2px solid #1E3A8A; padding-bottom:6px; margin-top:24px;">{html.escape(line_str[2:])}</h1>')
        elif line_str.startswith('## '):
            html_lines.append(f'<h2 style="color:#2563EB; font-family:Calibri, sans-serif; font-size:18pt; margin-top:20px;">{html.escape(line_str[3:])}</h2>')
        elif line_str.startswith('### '):
            html_lines.append(f'<h3 style="color:#7C3AED; font-family:Calibri, sans-serif; font-size:14pt; margin-top:16px;">{html.escape(line_str[4:])}</h3>')
        elif line_str.startswith('- ') or line_str.startswith('* '):
            html_lines.append(f'<li style="font-family:Calibri, sans-serif; font-size:11pt; margin-bottom:4px;">{html.escape(line_str[2:])}</li>')
        elif line_str.startswith('```'):
            continue
        else:
            if line_str:
                html_lines.append(f'<p style="font-family:Calibri, sans-serif; font-size:11pt; line-height:1.5; margin-bottom:8px;">{html.escape(line_str)}</p>')

if in_table:
    table_html.append('</table>')
    html_lines.append('\n'.join(table_html))

doc_html = f'''<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<title>SupplySense Documentation</title>
<style>
body {{ font-family: Calibri, sans-serif; margin: 1in; }}
h1 {{ color: #1E3A8A; }}
h2 {{ color: #2563EB; }}
h3 {{ color: #7C3AED; }}
table {{ border-collapse: collapse; width: 100%; margin-bottom: 20px; }}
th, td {{ border: 1px solid #CBD5E1; padding: 8px 12px; font-size: 10.5pt; }}
th {{ background-color: #0F172A; color: white; }}
</style>
</head>
<body>
{''.join(html_lines)}
</body>
</html>'''

with open(doc_path, 'w', encoding='utf-8') as f:
    f.write(doc_html)

print('Rich Word .doc generated successfully!')
