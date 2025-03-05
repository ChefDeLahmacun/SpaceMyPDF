#!/bin/bash

# Script to remove sensitive files from Git repository while keeping local copies

echo "🔒 PDFextend Repository Security Script 🔒"
echo "This script will remove sensitive files from Git tracking while keeping your local copies."
echo ""

# Get the current directory
CURRENT_DIR=$(pwd)
echo "Current directory: $CURRENT_DIR"
echo ""

# Check if we're in the PDFextend directory
if [[ ! -f "package.json" || ! -d ".git" ]]; then
  echo "❌ Error: This doesn't appear to be the PDFextend project root directory."
  echo "Please run this script from the root of your PDFextend project."
  exit 1
fi

echo "✅ Confirmed: Running in PDFextend project directory"
echo ""

# Step 1: Remove .env files from Git tracking
echo "Step 1: Removing environment files from Git tracking..."

# Check if .env.production exists
if [[ -f ".env.production" ]]; then
  git rm --cached .env.production
  echo "✅ Removed .env.production from Git tracking (kept local copy)"
else
  echo "ℹ️ .env.production not found, skipping"
fi

# Check if .env.development exists
if [[ -f ".env.development" ]]; then
  git rm --cached .env.development
  echo "✅ Removed .env.development from Git tracking (kept local copy)"
else
  echo "ℹ️ .env.development not found, skipping"
fi

echo ""

# Step 2: Remove markdown files with sensitive information
echo "Step 2: Removing markdown files with sensitive information..."

# Check if REMOVE_ENV_PRODUCTION.md exists
if [[ -f "REMOVE_ENV_PRODUCTION.md" ]]; then
  git rm --cached REMOVE_ENV_PRODUCTION.md
  echo "✅ Removed REMOVE_ENV_PRODUCTION.md from Git tracking (kept local copy)"
else
  echo "ℹ️ REMOVE_ENV_PRODUCTION.md not found, skipping"
fi

# Check if VERCEL_ENV_VARIABLES.md exists
if [[ -f "VERCEL_ENV_VARIABLES.md" ]]; then
  git rm --cached VERCEL_ENV_VARIABLES.md
  echo "✅ Removed VERCEL_ENV_VARIABLES.md from Git tracking (kept local copy)"
else
  echo "ℹ️ VERCEL_ENV_VARIABLES.md not found, skipping"
fi

echo ""

# Step 3: Verify .gitignore has the correct entries
echo "Step 3: Verifying .gitignore configuration..."

if grep -q ".env.production" .gitignore && grep -q ".env.development" .gitignore; then
  echo "✅ .gitignore is correctly configured"
else
  echo "⚠️ Warning: .gitignore may not be properly configured."
  echo "Please ensure it contains these lines:"
  echo ".env*.local"
  echo ".env.production"
  echo ".env.development"
fi

echo ""

# Step 4: Commit changes
echo "Step 4: Committing changes..."
echo ""
echo "Ready to commit changes with message: \"Remove sensitive files from repository\""
echo "Would you like to proceed? (y/n)"
read -r response

if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
  git commit -m "Remove sensitive files from repository"
  echo "✅ Changes committed"
  
  echo ""
  echo "Would you like to push these changes to GitHub now? (y/n)"
  read -r push_response
  
  if [[ "$push_response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    git push origin main
    echo "✅ Changes pushed to GitHub"
  else
    echo "ℹ️ Changes not pushed. You can push them later with: git push origin main"
  fi
else
  echo "ℹ️ Changes not committed. You can commit them later with: git commit -m \"Remove sensitive files from repository\""
fi

echo ""
echo "🎉 Script completed! 🎉"
echo "Next steps:"
echo "1. Verify the sensitive files are no longer visible in your GitHub repository"
echo "2. Follow the SECURE_DEPLOYMENT_GUIDE.md for deploying to Vercel" 