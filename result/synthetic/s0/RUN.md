# Synthetic s0 receipt

File: result/synthetic/s0/index.html

Command that reads that file and counts the words in the Objective paragraph:

```sh
awk '
  /<h2 id="objective-title">Objective<\/h2>/ { grab=1; next }
  grab && /<p>/ {
    line=$0
    sub(/^[[:space:]]*<p>/, "", line)
    sub(/<\/p>[[:space:]]*$/, "", line)
    print split(line, a, /[[:space:]]+/)
    exit
  }
' result/synthetic/s0/index.html
```

Output:

```
11
```

Command that reads the Objective paragraph in result/synthetic/s0/index.html and replaces the Evidence paragraph:

```sh
python3 - << 'PY'
from pathlib import Path
import re
path = Path("result/synthetic/s0/index.html")
html = path.read_text()
objective = re.search(
    r'<h2 id="objective-title">Objective</h2>\s*<p>([^<]*)</p>',
    html,
)
plan = re.search(
    r'<h2 id="plan-title">Plan</h2>\s*<p>([^<]*)</p>',
    html,
)
if objective is None or plan is None:
    raise SystemExit("objective or plan paragraph not found")
output = str(len(objective.group(1).split()))
updated, replaced = re.subn(
    r'(<h2 id="evidence-title">Evidence</h2>\s*<p>)[^<]*(</p>)',
    lambda match: match.group(1) + output + match.group(2),
    html,
    count=1,
)
if replaced != 1:
    raise SystemExit("evidence paragraph not replaced")
objective_after = re.search(
    r'<h2 id="objective-title">Objective</h2>\s*<p>([^<]*)</p>',
    updated,
)
plan_after = re.search(
    r'<h2 id="plan-title">Plan</h2>\s*<p>([^<]*)</p>',
    updated,
)
if objective_after.group(1) != objective.group(1) or plan_after.group(1) != plan.group(1):
    raise SystemExit("objective or plan changed")
path.write_text(updated)
print(output)
PY
```

Stop. No send, no spend, no merge, no deploy, and no person.
