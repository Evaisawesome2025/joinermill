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

Command that reads result/synthetic/s0/IN.txt and replaces the Objective paragraph in result/synthetic/s0/index.html:

```sh
python3 - << 'PY'
from pathlib import Path
import re
page = Path("result/synthetic/s0/index.html")
raw = Path("result/synthetic/s0/IN.txt").read_text()
if raw.endswith("\n"):
    raw = raw[:-1]
if raw == "" or "\n" in raw:
    raise SystemExit("IN.txt must be one line")
html = page.read_text()
objective = re.search(
    r'<h2 id="objective-title">Objective</h2>\s*<p>([^<]*)</p>',
    html,
)
plan = re.search(
    r'<h2 id="plan-title">Plan</h2>\s*<p>([^<]*)</p>',
    html,
)
evidence = re.search(
    r'<h2 id="evidence-title">Evidence</h2>\s*<p>([^<]*)</p>',
    html,
)
if objective is None or plan is None or evidence is None:
    raise SystemExit("objective, plan, or evidence paragraph not found")
updated, replaced = re.subn(
    r'(<h2 id="objective-title">Objective</h2>\s*<p>)[^<]*(</p>)',
    lambda match: match.group(1) + raw + match.group(2),
    html,
    count=1,
)
if replaced != 1:
    raise SystemExit("objective paragraph not replaced")
plan_after = re.search(
    r'<h2 id="plan-title">Plan</h2>\s*<p>([^<]*)</p>',
    updated,
)
evidence_after = re.search(
    r'<h2 id="evidence-title">Evidence</h2>\s*<p>([^<]*)</p>',
    updated,
)
if plan_after.group(1) != plan.group(1) or evidence_after.group(1) != evidence.group(1):
    raise SystemExit("plan or evidence changed")
page.write_text(updated)
print(raw)
PY
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

Output:

```
Synthetic test only. Add one word and stop.
8
```

Command that reads the Objective paragraph in result/synthetic/s0/index.html and writes the Evidence paragraph as that text plus the word stopped:

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
output = objective.group(1) + " stopped"
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
