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

Stop. No send, no spend, no merge, no deploy, and no person.
