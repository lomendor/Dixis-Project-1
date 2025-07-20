#!/bin/bash

# Dixis Git Branch Cleanup Script
# This script helps clean up and organize git branches

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" >&2
}

warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    error "Not in a git repository!"
    exit 1
fi

# Update remote references
log "Fetching latest from remote..."
git fetch --all --prune

# Get current branch
current_branch=$(git branch --show-current)
info "Current branch: $current_branch"

# List all branches
echo ""
log "All branches (local and remote):"
echo "================================="
git branch -a

# Analyze branches
echo ""
log "Branch Analysis:"
echo "================"

# Local branches that are merged into develop
echo ""
info "Local branches already merged into develop:"
git branch --merged develop | grep -v -E "(^\*|main|develop)" || echo "None"

# Remote branches that are merged into develop
echo ""
info "Remote branches already merged into develop:"
git branch -r --merged origin/develop | grep -v -E "(main|develop|HEAD)" || echo "None"

# Branches with no remote tracking
echo ""
info "Local branches with no remote tracking:"
git branch -vv | grep ': gone]' | awk '{print $1}' || echo "None"

# Old branches (no activity in 30 days)
echo ""
info "Branches with no activity in 30+ days:"
for branch in $(git for-each-ref --format='%(refname:short)' refs/heads/); do
    last_commit=$(git log -1 --format="%ci" $branch)
    last_commit_date=$(date -d "$last_commit" +%s 2>/dev/null || date -j -f "%Y-%m-%d %H:%M:%S" "$last_commit" +%s)
    current_date=$(date +%s)
    days_old=$(( ($current_date - $last_commit_date) / 86400 ))
    
    if [ $days_old -gt 30 ]; then
        echo "  - $branch (last commit: $last_commit - $days_old days ago)"
    fi
done

# Interactive cleanup
echo ""
warning "Ready to clean up branches?"
echo "This will:"
echo "1. Delete local branches that are merged into develop"
echo "2. Delete local branches with no remote tracking"
echo "3. Archive old feature branches"
echo ""
read -p "Continue? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Ensure we're not on a branch we're about to delete
    if [[ "$current_branch" != "main" && "$current_branch" != "develop" ]]; then
        warning "Switching to develop branch for safety..."
        git checkout develop
    fi
    
    # Delete merged branches
    log "Deleting local branches merged into develop..."
    git branch --merged develop | grep -v -E "(^\*|main|develop)" | xargs -r git branch -d || true
    
    # Delete branches with no remote
    log "Deleting local branches with no remote tracking..."
    git branch -vv | grep ': gone]' | awk '{print $1}' | xargs -r git branch -D || true
    
    # Archive old branches
    log "Archiving old feature branches..."
    for branch in $(git for-each-ref --format='%(refname:short)' refs/heads/ | grep -E '^feature/'); do
        last_commit=$(git log -1 --format="%ci" $branch)
        last_commit_date=$(date -d "$last_commit" +%s 2>/dev/null || date -j -f "%Y-%m-%d %H:%M:%S" "$last_commit" +%s)
        current_date=$(date +%s)
        days_old=$(( ($current_date - $last_commit_date) / 86400 ))
        
        if [ $days_old -gt 30 ]; then
            archive_name="archive/$(date +%Y%m)/$branch"
            info "Archiving $branch to $archive_name"
            git tag "$archive_name" "$branch"
            git branch -D "$branch"
        fi
    done
    
    log "Cleanup completed!"
    
    # Show final state
    echo ""
    log "Remaining local branches:"
    git branch
    
    echo ""
    info "To push archived tags to remote:"
    echo "git push origin --tags"
    
    echo ""
    info "To delete remote branches that were merged:"
    echo "git push origin --delete branch-name"
    
else
    info "Cleanup cancelled."
fi

# Recommendations
echo ""
log "Recommendations:"
echo "================"
echo "1. Always create branches from 'develop' for new features"
echo "2. Use descriptive branch names: feature/shopping-cart, fix/payment-bug"
echo "3. Delete branches after merging"
echo "4. Keep 'main' as production-ready code"
echo "5. Use 'develop' for integration"

echo ""
log "Git branch cleanup complete!"