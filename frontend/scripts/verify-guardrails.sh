#!/bin/bash

# CI Guardrails Verification Script
# This script mimics the checks performed by the GitHub Actions workflow.

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔍 Starting CI Guardrails Verification...${NC}"

EXIT_CODE=0

# 1. Check for prohibited file changes
echo -e "\n${YELLOW}1. Checking for prohibited file changes...${NC}"
# In local environment, we check changes in the current branch against main
# If main doesn't exist locally, we try origin/main
BASE_BRANCH="main"
if ! git show-ref --verify --quiet refs/heads/main; then
    BASE_BRANCH="origin/main"
fi

# Get changed files (staged + unstaged + committed in branch)
# This is a bit tricky locally, so we'll check:
# - Unstaged changes
# - Staged changes
# - Commits differing from main
CHANGED_FILES=$(git diff --name-only $BASE_BRANCH...HEAD 2>/dev/null || git diff --name-only HEAD)
# Also add currently modified files
CHANGED_FILES="$CHANGED_FILES $(git diff --name-only)"
CHANGED_FILES="$CHANGED_FILES $(git diff --name-only --cached)"

VIOLATIONS=""
for FILE in $CHANGED_FILES; do
    # Remove duplicates and empty lines
    FILE=$(echo "$FILE" | xargs) 
    if [ -z "$FILE" ]; then continue; fi
    
    case "$FILE" in
        *eslint.config.*|*.eslintrc*|*.github/workflows/*|*package.json|*pnpm-lock.yaml|*package-lock.json|*yarn.lock|*tailwind.config.*|*postcss.config.*)
            VIOLATIONS="$VIOLATIONS\n- $FILE"
            ;;
    esac
done

if [ -n "$VIOLATIONS" ]; then
    echo -e "${RED}❌ Prohibited file changes detected:${NC}$VIOLATIONS"
    echo -e "${RED}   These files cannot be modified according to the CI guardrails.${NC}"
    EXIT_CODE=1
else
    echo -e "${GREEN}✅ No prohibited file changes found.${NC}"
fi

# 2. Check for eslint-disable comments
echo -e "\n${YELLOW}2. Checking for eslint-disable comments...${NC}"
DISABLE_FOUND=$(grep -rnE "eslint-disable|eslint-disable-next-line|eslint-disable-line" . --exclude-dir={.next,node_modules,.git,scripts,.github} --exclude=issue_10.txt --exclude=scripts/verify-guardrails.sh --exclude=*.md --exclude=*.txt)

if [ -n "$DISABLE_FOUND" ]; then
    echo -e "${RED}❌ eslint-disable comments detected:${NC}"
    echo "$DISABLE_FOUND"
    EXIT_CODE=1
else
    echo -e "${GREEN}✅ No eslint-disable comments found.${NC}"
fi

# 3. Run Lint (Strict)
echo -e "\n${YELLOW}3. Running Lint (Strict)...${NC}"
# We'll use the check-lint script if it exists, otherwise standard lint
# Also ensuring max-warnings=0 to treat warnings as errors
if pnpm run lint --max-warnings=0; then
    echo -e "${GREEN}✅ Lint passed.${NC}"
else
    echo -e "${RED}❌ Lint failed.${NC}"
    EXIT_CODE=1
fi

echo -e "\n----------------------------------------"
if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}🎉 All Guardrails Passed!${NC}"
else
    echo -e "${RED}💥 Guardrails Failed! Please fix the issues above.${NC}"
fi

exit $EXIT_CODE
