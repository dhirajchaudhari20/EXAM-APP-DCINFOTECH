import sys
content = open('/Users/dhirajchaudhari/Downloads/dcinfotech-office/exam-portal/js/main.js', 'r', encoding='utf-8').read()
idx = content.find("SHEETDB_RESULTS_URL")
if idx != -1:
    print(content[max(0, idx-500) : min(len(content), idx+500)])
else:
    print("Not found")
