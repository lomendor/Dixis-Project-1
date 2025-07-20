#!/bin/bash
# GitHub Branch Cleanup Script
# Usage: ./scripts/github-cleanup.sh

echo "🧹 GitHub Branch Cleanup Script"
echo "==============================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to archive branch as tag
archive_branch() {
    local branch=$1
    local tag_name="archive/${branch#origin/}"
    
    echo -e "${YELLOW}Archiving branch: $branch as $tag_name${NC}"
    git tag $tag_name $branch
    echo -e "${GREEN}✓ Archived${NC}"
}

# Function to delete remote branch
delete_remote_branch() {
    local branch=$1
    local branch_name=${branch#origin/}
    
    echo -e "${RED}Deleting remote branch: $branch_name${NC}"
    git push origin --delete $branch_name
    echo -e "${GREEN}✓ Deleted${NC}"
}

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}Error: Not in a git repository${NC}"
    exit 1
fi

# Fetch latest remote information
echo "Fetching latest remote information..."
git fetch --all --prune

# List stale branches for review
echo -e "\n${YELLOW}Stale branches (>8 weeks old):${NC}"
for branch in $(git branch -r | grep -v HEAD); do
    last_commit=$(git log -1 --format="%cr" $branch)
    weeks_old=$(git log -1 --format="%cr" $branch | grep -o '[0-9]*' | head -1)
    
    if [[ $last_commit == *"weeks"* ]] && [ $weeks_old -gt 8 ]; then
        echo "$branch - $last_commit"
    fi
done

# Interactive mode
echo -e "\n${YELLOW}What would you like to do?${NC}"
echo "1. Archive and delete backup branches"
echo "2. Archive and delete old feature branches"
echo "3. Show branch statistics"
echo "4. Exit"

read -p "Select option (1-4): " choice

case $choice in
    1)
        echo -e "\n${YELLOW}Processing backup branches...${NC}"
        for branch in $(git branch -r | grep "backup/"); do
            archive_branch $branch
            delete_remote_branch $branch
        done
        ;;
    2)
        echo -e "\n${YELLOW}Processing old feature branches...${NC}"
        # List branches to process
        OLD_BRANCHES=(
            "origin/fix/search-filters-infinite-loop"
            "origin/feature/product-recommendations"
            "origin/feature/improved-shipping-map"
            "origin/feature/improved-homepage"
            "origin/cleanup/remove-unused-folders"
        )
        
        for branch in "${OLD_BRANCHES[@]}"; do
            if git branch -r | grep -q "$branch"; then
                archive_branch $branch
                delete_remote_branch $branch
            fi
        done
        ;;
    3)
        echo -e "\n${YELLOW}Branch Statistics:${NC}"
        echo "Total remote branches: $(git branch -r | wc -l)"
        echo "Feature branches: $(git branch -r | grep "feature/" | wc -l)"
        echo "Bugfix branches: $(git branch -r | grep -E "fix/|bugfix/" | wc -l)"
        echo "Backup branches: $(git branch -r | grep "backup/" | wc -l)"
        ;;
    4)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid option${NC}"
        exit 1
        ;;
esac

echo -e "\n${GREEN}✓ Cleanup complete!${NC}"
echo "Don't forget to run 'git remote prune origin' to clean up local references"