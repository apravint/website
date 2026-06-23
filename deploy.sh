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
# Remove old build files in docs
rm -rf docs/browser docs/prerendered-routes.json docs/3rdpartylicenses.txt

# Copy new build outputs to docs
cp -r dist/website/* docs/

echo "=========================================================="
echo "          Build Completed & Copied to docs/               "
echo "=========================================================="
echo "To publish the updates live to pravintamilan.com, run:"
echo "  git add ."
echo "  git commit -m 'Upgrade news page layout & settings'"
echo "  git push origin main"
echo "=========================================================="
