# Synthetic inbound receipt

File: result/synthetic/inbound/index.html

Command that reads result/synthetic/inbound/MESSAGE.txt and writes that line as the Objective paragraph. Plan and Evidence stay on the blank sentence.

```sh
python3 - << 'PY'
from pathlib import Path
import re
page = Path("result/synthetic/inbound/index.html")
raw = Path("result/synthetic/inbound/MESSAGE.txt").read_text()
if raw.endswith("\n"):
    raw = raw[:-1]
if raw == "" or "\n" in raw:
    raise SystemExit("MESSAGE.txt must be one line")
html = page.read_text()
blank = "None. This page has no subject."
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
if plan.group(1) != blank or evidence.group(1) != blank:
    raise SystemExit("plan or evidence is not the blank sentence")
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
if plan_after.group(1) != blank or evidence_after.group(1) != blank:
    raise SystemExit("plan or evidence changed")
page.write_text(updated)
print(raw)
PY
```

Output:

```
Synthetic message only. Not a person. Not sent.
```

Stop. No send, no spend, no merge, no deploy, and no person.
