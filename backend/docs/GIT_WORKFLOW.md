# Git Workflow & Branching Strategy για Dixis Marketplace

## 🎯 Βασικές Αρχές

### Branch Types
1. **main** - Production-ready code (πάντα stable)
2. **develop** - Integration branch για development
3. **feature/** - Νέα features
4. **fix/** - Bug fixes
5. **hotfix/** - Emergency fixes για production
6. **release/** - Release preparation

## 📋 Κανόνες Branching

### Main Branch
- **ΠΟΤΕ** δεν κάνουμε direct commits
- Μόνο μέσω Pull Requests
- Πρέπει να περνάει όλα τα tests
- Represents production code

### Feature Development
```bash
# Ξεκινάμε από develop
git checkout develop
git pull origin develop

# Δημιουργούμε feature branch
git checkout -b feature/new-shopping-cart

# Κάνουμε τις αλλαγές μας
git add .
git commit -m "feat: add shopping cart functionality"

# Push to GitHub
git push origin feature/new-shopping-cart
```

### Bug Fixes
```bash
# Για non-critical bugs
git checkout develop
git checkout -b fix/cart-calculation-error

# Για critical bugs σε production
git checkout main
git checkout -b hotfix/payment-gateway-error
```

## 🔄 Merge Process

### Feature → Develop
1. Ολοκλήρωση feature
2. Create Pull Request
3. Code review
4. Run tests
5. Merge

### Develop → Main (Release)
```bash
# Create release branch
git checkout develop
git checkout -b release/v1.2.0

# Final testing & fixes
# Then merge to main
git checkout main
git merge --no-ff release/v1.2.0
git tag -a v1.2.0 -m "Release version 1.2.0"

# Back-merge to develop
git checkout develop
git merge --no-ff release/v1.2.0
```

## 📝 Commit Message Format

### Types
- **feat**: Νέο feature
- **fix**: Bug fix
- **docs**: Documentation
- **style**: Formatting, missing semicolons, etc
- **refactor**: Code restructuring
- **test**: Adding tests
- **chore**: Maintenance tasks

### Examples
```
feat: add multi-language support
fix: resolve cart total calculation error
docs: update API documentation
refactor: optimize database queries
test: add unit tests for shipping calculator
```

## 🚨 Τρέχουσα Κατάσταση & Cleanup Plan

### Πρόβλημα
- 14+ branches με 144 commits ahead of main
- Πολλά overlapping features
- Main branch outdated

### Λύση - Immediate Actions
1. **Backup current work**
   ```bash
   git checkout feature/testing-suite-and-improvements
   git branch backup/all-work-backup
   ```

2. **Create develop branch**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b develop
   ```

3. **Consolidate stable features**
   - Review each feature branch
   - Merge completed features to develop
   - Delete merged branches

4. **Update main**
   - Test develop thoroughly
   - Create release branch
   - Merge to main

## 🛡️ Branch Protection Rules

### Main Branch
- Require pull request reviews (1+)
- Require status checks to pass
- Require branches to be up to date
- Include administrators

### Develop Branch
- Require pull request reviews
- Dismiss stale reviews
- Require status checks

## 📊 Current Branches Analysis

### To Keep & Merge
1. `feature/testing-suite-and-improvements` - Latest work
2. `feature/admin-dashboard-implementation` - Completed feature
3. `fix/api-error-handling` - Important fixes

### To Review
- `feature/improved-search`
- `feature/improved-shipping-map`
- `feature/product-recommendations`

### To Archive/Delete
- Old feature branches already merged
- Experimental branches

## 🔧 Git Commands Cheatsheet

```bash
# Δες local & remote branches
git branch -a

# Δες commits ahead/behind
git log --oneline main..HEAD

# Clean up local branches
git branch -d branch-name

# Force delete unmerged branch
git branch -D branch-name

# Delete remote branch
git push origin --delete branch-name

# Fetch & prune deleted remote branches
git fetch --prune

# Interactive rebase (για cleanup commits)
git rebase -i HEAD~10

# Squash last N commits
git reset --soft HEAD~N
git commit -m "feat: consolidated feature"

# Stash changes temporarily
git stash save "work in progress"
git stash pop

# Cherry-pick specific commit
git cherry-pick commit-hash
```

## 📅 Recommended Workflow Moving Forward

### Daily Development
1. Pull latest from develop
2. Create feature branch
3. Make small, focused commits
4. Push regularly
5. Create PR when ready

### Weekly
1. Review open PRs
2. Merge completed features
3. Clean up merged branches
4. Update project board

### Release Cycle (Bi-weekly)
1. Feature freeze on develop
2. Create release branch
3. Testing & bug fixes only
4. Merge to main & tag
5. Deploy to production

## 🚀 Next Steps

1. **Immediate**: Backup current work
2. **Today**: Create develop branch
3. **This Week**: Consolidate branches
4. **Next Week**: Implement CI/CD with branch protection

---

**Σημείωση**: Αυτό το workflow βασίζεται στο Git Flow αλλά απλοποιημένο για μικρότερη ομάδα. Προσαρμόστε το ανάλογα με τις ανάγκες σας.