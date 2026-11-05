import os

target_extensions = ('.py', '.java', '.cpp', '.js', '.html', '.css')
ignore_folders = ['node_modules', '.grok', '.git', 'status', 'migrations']

total_lines = 0
print("\n" + "="*40)
print("       OFFICIAL CODE VERIFICATION      ")
print("="*40)

# Walk through all directories
for root, dirs, files in os.walk('.'):
    # Skip tracking background module/junk folders
    if any(ignore in root for ignore in ignore_folders):
        continue
        
    for file in files:
        if file.endswith(target_extensions) and file != 'dataset.py':
            file_path = os.path.join(root, file)
            try:
                with open(file_path, 'r', errors='ignore', encoding='utf-8') as f:
                    lines = len(f.readlines())
                    total_lines += lines
                    print(f"📄 {file:<25} : {lines:,} lines")
            except Exception:
                pass

print("="*40)
print(f"🏆 TOTAL CORE CODE LINES: {total_lines:,}")
print("="*40 + "\n")
