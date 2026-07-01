#!/data/data/com.termux/files/usr/bin/zsh

# 1. Compile the Angular app
echo "Building the Angular production bundle..."
node ./node_modules/@angular/cli/bin/ng build --configuration production

if [ $? -ne 0 ]; then
  echo "Build failed. Aborting deployment."
  exit 1
fi

# 2. Update the docs directory
echo "Updating deployment directory (docs/)..."
# Remove old build files in docs (preserve CNAME if it exists)
find docs/ -mindepth 1 -not -name "CNAME" -delete

# Copy new browser build outputs directly to root of docs
cp -r dist/website/browser/* docs/
# Copy auxiliary build files
cp dist/website/3rdpartylicenses.txt docs/ 2>/dev/null || true
cp dist/website/prerendered-routes.json docs/ 2>/dev/null || true

echo "=========================================================="
echo "          Build Completed & Copied to docs/               "
echo "=========================================================="
echo "To publish the updates live to pravintamilan.com, run:"
echo "  git add ."
echo "  git commit -m 'Upgrade news page layout & settings'"
echo "  git push origin main"
echo "=========================================================="
