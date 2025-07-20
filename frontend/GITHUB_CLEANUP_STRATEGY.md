# GitHub Repository Cleanup Strategy 🧹

## Current State Analysis
- **Total Remote Branches**: 36
- **Stale Branches** (>4 weeks old): ~20
- **Active Development**: feature/pr18-phase1-integration

## Recommended Actions

### 1. Immediate Cleanup (Safe to Archive & Delete)
These branches are merged or superseded:
- `fix/search-filters-infinite-loop` (9 weeks old)
- `feature/product-recommendations` (9 weeks old)
- `feature/improved-shipping-map` (9 weeks old)
- `feature/improved-homepage` (9 weeks old)
- `cleanup/remove-unused-folders` (9 weeks old)
- `fix/api-error-handling` (8 weeks old)

### 2. Backup Branches (Archive with Tags)
Convert to tags before deletion:
```bash
# Example:
git tag archive/backup-production-ready-20250621 origin/backup/production-ready-20250621-1437
git tag archive/backup-pre-cleanup-20250524 origin/backup/pre-cleanup-20250524-125613
git tag archive/claude-code-work-20250531 origin/claude-code-work-backup-20250531-103127
```

### 3. Feature Branches to Review
Check if these have unmerged changes:
- `feature/admin-dashboard-implementation`
- `feature/testing-suite-and-improvements`
- `feature/design-system-implementation`
- `enterprise-integrations-system-20250125`
- `b2b-marketplace-implementation-20250125`

### 4. Proposed Branch Structure
```
main (production)
├── develop (integration branch)
└── feature/pr18-phase1-integration (current work)
```

### 5. Branch Naming Convention
Going forward:
- `feature/[issue-number]-[short-description]`
- `bugfix/[issue-number]-[short-description]`
- `hotfix/[critical-issue]`
- `release/v[version]`

### 6. Cleanup Commands
```bash
# 1. Create archive tags for important branches
git tag archive/[branch-name] origin/[branch-name]

# 2. Delete remote branches
git push origin --delete [branch-name]

# 3. Clean up local references
git remote prune origin
git branch -d [local-branch-name]
```

### 7. GitHub Settings to Configure
1. **Default Branch**: Ensure `main` is default
2. **Branch Protection Rules**:
   - Require pull request reviews (1-2 reviewers)
   - Dismiss stale PR approvals
   - Require branches to be up to date
   - Include administrators
3. **Auto-delete head branches** after merge

### 8. Project Board Structure
```yaml
Columns:
  Backlog: New issues and ideas
  Sprint Ready: Prioritized for next sprint
  In Progress: Currently being worked on
  In Review: PR submitted
  Testing: QA/Testing phase
  Done: Completed and merged
```

### 9. Issue Labels
```yaml
Type:
  - bug 🐛
  - feature ✨
  - enhancement 💄
  - documentation 📚
  - refactor ♻️
  - performance ⚡
  - security 🔒

Priority:
  - critical 🔴
  - high 🟠
  - medium 🟡
  - low 🟢

Status:
  - needs-triage
  - ready
  - blocked
  - in-progress
  - review-needed
```

## Execution Order
1. **Week 1**: Archive backup branches as tags
2. **Week 1**: Delete obviously stale branches
3. **Week 2**: Review and merge/close active feature branches
4. **Week 2**: Set up GitHub Project Board
5. **Week 3**: Implement branch protection rules
6. **Ongoing**: Maintain clean branch structure

## Benefits
- ✅ Easier navigation
- ✅ Clear development flow
- ✅ Better collaboration
- ✅ Reduced confusion
- ✅ Improved CI/CD performance