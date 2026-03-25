#!/bin/bash
cd "$(dirname "$0")"
cp debtor-app.html index.html
git add .
git commit -m "update"
git push origin main --force
echo "Done! Netlify will update automatically."
