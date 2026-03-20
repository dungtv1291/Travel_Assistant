f = r'd:\Travel_Assistant\app\ai-planner\results.tsx'
with open(f, 'r', encoding='utf-8') as file:
    content = file.read()

danang = chr(0xB2E4) + chr(0xB0AD)
target = "destination: destination ?? '" + danang + "',"
new_str = 'destination: destination ?? defaultDest,'
count = content.count(target)
print(f'Found {count} occurrences of Korean default destination')
content = content.replace(target, new_str)
with open(f, 'w', encoding='utf-8') as file:
    file.write(content)
print('Done')
