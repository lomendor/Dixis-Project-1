# 📚 Documentation Maintenance Workflow

**System**: Context Engineering Truth-Based Documentation  
**Version**: 1.0  
**Created**: 2025-07-24  
**Purpose**: Maintain documentation accuracy and prevent conflicts

---

## 🎯 **Workflow Overview**

This workflow ensures that project documentation remains accurate, conflict-free, and aligned with platform reality through automated Context Engineering verification.

### **Core Principles**
1. **Truth-Based**: All documentation must align with verified platform functionality
2. **Protected Masters**: Core documents are protected from accidental modification
3. **Automated Monitoring**: Continuous drift detection prevents conflicts
4. **Git History Preservation**: All changes maintain version control integrity

---

## 🛡️ **Protected Documents System**

### **Master Documents (Never Archive)**
These documents are permanently protected from audit archiving:

- **`CLAUDE.md`** - Primary enterprise platform context
- **`MASTER_STATUS.md`** - Reality-based progress tracking  
- **`docs/MD_DOCUMENTATION_INDEX.md`** - This documentation index
- **`context-engine.json`** - Context Engineering configuration
- **`scripts/context-hooks.js`** - Automation engine

### **Protection Features**
- ✅ Excluded from conflict detection
- ✅ Cannot be automatically archived
- ✅ Special validation for changes
- ✅ Version tracking with approval workflow

---

## 🔄 **Monthly Maintenance Routine**

### **1. Automated Truth Verification (5 minutes)**
```bash
# Run comprehensive documentation audit
cd "/path/to/GitHub-Dixis-Project-1"
node scripts/context-hooks.js documentation-audit

# Check for documentation drift
node scripts/context-hooks.js drift-check

# Verify platform functionality alignment
node scripts/context-hooks.js verify
```

### **2. Review Audit Results (10 minutes)**
- Check for new conflicting claims
- Verify percentage consistency across files
- Identify outdated information
- Review protected document status

### **3. Archive Management (15 minutes)**
```bash
# Run full audit and archive outdated files
node scripts/audit-md-files.js

# Create new archive structure if needed
node scripts/create-archive-structure.js

# Update documentation index
# (Manual review of docs/MD_DOCUMENTATION_INDEX.md)
```

---

## 📝 **Documentation Update Process**

### **For Regular Documentation Updates**

#### **Step 1: Pre-Update Verification**
```bash
# Check current documentation status
node scripts/context-hooks.js status

# Verify no existing conflicts
node scripts/context-hooks.js drift-check
```

#### **Step 2: Make Changes**
- Edit the target documentation file
- Ensure claims align with Context Engineering results  
- Update any affected cross-references
- Follow existing formatting and structure

#### **Step 3: Post-Update Validation**
```bash
# Run drift detection to verify no new conflicts
node scripts/context-hooks.js drift-check

# Update documentation index if needed
# (Add new files to docs/MD_DOCUMENTATION_INDEX.md)

# Commit changes with descriptive message
git add .
git commit -m "docs: update [description] - verified against Context Engineering"
```

### **For Master Document Updates**

#### **Protected Document Approval Process**
1. **Verify Authority**: Only update master documents for significant changes
2. **Context Engineering Alignment**: Ensure changes reflect verified platform reality
3. **Cross-Reference Check**: Update all dependent documentation
4. **Enhanced Testing**: Run full verification suite before committing

#### **Master Document Change Commands**
```bash
# Before editing CLAUDE.md or MASTER_STATUS.md
node scripts/context-hooks.js verify

# After editing master documents
node scripts/context-hooks.js documentation-audit
node scripts/context-hooks.js drift-check

# If no conflicts, commit with special notation
git commit -m "docs: MASTER UPDATE - [description] - Context Engineering verified"
```

---

## 🚨 **Conflict Resolution Workflow**

### **When Drift Detection Finds Conflicts**

#### **1. Analyze Conflict Report**
```bash
# Get detailed conflict analysis
node scripts/context-hooks.js documentation-audit
```

Review the output for:
- **Percentage Conflicts**: Different completion claims across files
- **Critical Bug Claims**: References to resolved issues
- **Business Value Conflicts**: Inconsistent value statements

#### **2. Truth Verification**
```bash
# Verify current platform functionality
node scripts/context-hooks.js verify

# Check specific claims against real testing
node scripts/context-hooks.js test-registration
node scripts/context-hooks.js test-cart
```

#### **3. Resolution Actions**

**For Outdated Claims:**
```bash
# Archive outdated file if no longer relevant
git mv path/to/outdated.md docs/archive/outdated-md-$(date +%Y-%m-%d)/

# Or update claims to match verified reality
# Edit file to align with Context Engineering results
```

**For Protected Document Conflicts:**
- Review the conflict carefully (should be rare)
- Verify against latest Context Engineering results
- Update with special approval process
- Document the reason for the change

#### **4. Verification and Cleanup**
```bash
# Confirm conflicts resolved
node scripts/context-hooks.js drift-check

# Update documentation index if files were archived
# Edit docs/MD_DOCUMENTATION_INDEX.md

# Commit resolution
git commit -m "docs: resolve conflicts - aligned with Context Engineering verification"
```

---

## 🔧 **Adding New Documentation**

### **New File Creation Process**

#### **1. Determine File Category**
- **Technical Documentation**: Component/API specific
- **Business Documentation**: Strategy/planning related
- **Context Engineering**: Automation/verification related
- **Archive Documentation**: Historical/reference only

#### **2. Follow Naming Conventions**
- **Descriptive Names**: `COMPONENT_FEATURE_DOCUMENTATION.md`
- **Date Inclusion**: For time-sensitive docs `REPORT_2025-07-24.md`
- **Category Prefixes**: `API_`, `BUSINESS_`, `CONTEXT_` for clarity

#### **3. Content Standards**
```markdown
# Title with Emoji Icon

**Purpose**: Clear statement of document purpose
**Status**: ✅ Active | ⚠️ Needs Update | 📦 Archive Candidate
**Last Verified**: Date of last Context Engineering verification

## Content following project standards...
```

#### **4. Integration Process**
```bash
# Create new file
touch path/to/NEW_DOCUMENTATION.md

# Add to documentation index
# Edit docs/MD_DOCUMENTATION_INDEX.md to include new file

# Verify no conflicts introduced
node scripts/context-hooks.js drift-check

# Commit with documentation tag
git add .
git commit -m "docs: add NEW_DOCUMENTATION.md - Context Engineering integrated"
```

---

## 📊 **Quality Metrics Monitoring**

### **Documentation Health Indicators**

#### **Green Status (Healthy)**
- ✅ Zero conflicts in drift detection
- ✅ All master documents protected and current
- ✅ Archive structure organized and current
- ✅ Truth score >90% across active files

#### **Yellow Status (Needs Attention)**
- ⚠️ 1-3 minor conflicts detected
- ⚠️ Some files >30 days without verification
- ⚠️ Archive growing rapidly (>10 files/month)
- ⚠️ Truth score 70-90% average

#### **Red Status (Requires Action)**
- 🚨 >3 conflicts or any high-severity conflicts
- 🚨 Master documents showing conflicts
- 🚨 Protected documents accidentally modified
- 🚨 Truth score <70% average

### **Monthly Quality Report**
```bash
# Generate comprehensive quality report
node scripts/audit-md-files.js > monthly-docs-audit-$(date +%Y-%m).log

# Review key metrics:
# - Total active files
# - Average truth score
# - Conflicts found and resolved
# - Archive growth rate
# - Protected document integrity
```

---

## 🎯 **Best Practices**

### **Do's ✅**
- **Always verify claims** against Context Engineering results
- **Use automated tools** for routine conflict detection
- **Preserve Git history** when archiving files
- **Update cross-references** when moving or updating files
- **Follow naming conventions** for consistency
- **Regular maintenance** to prevent conflict accumulation

### **Don'ts ❌**
- **Never manually archive** protected documents
- **Don't bypass drift detection** before committing changes
- **Avoid duplicate information** across multiple files
- **Don't make unverified claims** about platform functionality
- **Never force-push** documentation changes without verification
- **Don't ignore conflict warnings** from automated tools

### **Emergency Procedures**
If the documentation system becomes corrupted:

1. **Stop all documentation changes**
2. **Restore from backup**: `docs/archive/pre-audit-backup-[date]/`
3. **Run full system verification**: `node scripts/context-hooks.js verify`
4. **Re-run documentation audit**: `node scripts/audit-md-files.js`
5. **Contact system administrator** for complex conflicts

---

## 🔗 **Integration with Development Workflow**

### **Pre-Development**
- Review relevant documentation for current status
- Verify claims against actual platform capabilities
- Update development plans based on documented reality

### **During Development**
- Update documentation as features are implemented
- Verify new functionality claims with Context Engineering
- Maintain documentation accuracy throughout development cycle

### **Post-Development**
- Run full documentation audit after major changes
- Update completion percentages based on verified functionality
- Archive outdated planning documents

### **Release Preparation**
- Complete documentation truth verification
- Resolve all conflicts before release
- Generate clean documentation package for stakeholders

---

## 📞 **Support and Troubleshooting**

### **Common Issues**

#### **"Protected document shows in conflicts"**
```bash
# Verify protected document list
node scripts/context-hooks.js documentation-audit

# Check if file path changed
ls -la CLAUDE.md MASTER_STATUS.md docs/MD_DOCUMENTATION_INDEX.md
```

#### **"Drift detection not finding obvious conflicts"**
```bash
# Run with verbose output
node scripts/context-hooks.js drift-check

# Check if files are in archive (excluded from scanning)
find . -name "*.md" -path "*/archive/*" | wc -l
```

#### **"Documentation index out of sync"**
```bash
# Regenerate documentation index
node scripts/create-md-index.js

# Or manually update docs/MD_DOCUMENTATION_INDEX.md
```

### **System Recovery**
For complete system restoration:
```bash
# Restore all documentation from backup
cp -r docs/archive/pre-audit-backup-[latest]/* .

# Restart Context Engineering
node scripts/context-hooks.js status

# Re-run documentation audit
node scripts/audit-md-files.js
```

---

**🏆 Context Engineering Achievement**: Automated, truth-based documentation maintenance system with protected master documents, conflict detection, and quality metrics monitoring. This workflow ensures sustainable documentation accuracy and prevents information drift across the project lifecycle.

**📍 Next Actions**: Implement monthly maintenance routine and integrate with development workflow for continuous documentation quality assurance.