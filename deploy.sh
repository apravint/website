#!/usr/bin/env bash

# 1. Check and install dependencies if node_modules is missing
if [ ! -d "node_modules" ]; then
  echo "Installing Next.js dependencies..."
  npm install
fi

# 2. Compile the Next.js app in static export mode
echo "Building Next.js production bundle..."
npm run build

if [ $? -ne 0 ]; then
  echo "Build failed. Aborting deployment."
  exit 1
fi

# 3. Update the docs directory
echo "Updating deployment directory (docs/)..."
rm -rf docs/*
cp -r out/* docs/
cp public/CNAME docs/CNAME 2>/dev/null || true

echo "=========================================================="
echo "          Build Completed & Copied to docs/               "
echo "=========================================================="
echo "To publish the updates live to www.pravintamilan.com, run:"
echo "  git add ."
echo "  git commit -m 'Deploy updated Next.js portfolio & God\'s Eye feature'"
echo "  git push origin main"
echo "=========================================================="
