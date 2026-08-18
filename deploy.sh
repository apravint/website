#!/data/data/com.termux/files/usr/bin/zsh

# 1. Check and install dependencies if node_modules is missing
if [ ! -d "node_modules" ]; then
  echo "Installing Next.js dependencies..."
  npm install
fi

# 2. Compile the Next.js app in static export mode
echo "Building the Next.js production bundle with Webpack..."
node node_modules/.bin/next build --webpack

if [ $? -ne 0 ]; then
  echo "Build failed. Aborting deployment."
  exit 1
fi

# 3. Update the docs directory
echo "Updating deployment directory (docs/)..."
# Remove old build files in docs (preserve CNAME if it exists)
find docs/ -mindepth 1 -not -name "CNAME" -delete

# Copy new browser build outputs directly to root of docs
cp -r out/* docs/
# Copy CNAME custom domain file
cp CNAME docs/CNAME 2>/dev/null || true

echo "=========================================================="
echo "          Build Completed & Copied to docs/               "
echo "=========================================================="
echo "To publish the updates live to pravintamilan.com, run:"
echo "  git add ."
echo "  git commit -m 'Deploy new Next.js portfolio website'"
echo "  git push origin nextjs-rewrite"
echo "=========================================================="
