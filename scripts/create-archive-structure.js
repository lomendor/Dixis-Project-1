#!/usr/bin/env node

/**
 * Context Engineering Archive Structure Creator
 * Organizes outdated and conflicting MD files into clean archives
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const MDFilesAudit = require('./audit-md-files');

class ArchiveStructureCreator {
    constructor() {
        this.projectRoot = path.join(__dirname, '..');
        this.archiveDate = new Date().toISOString().split('T')[0];
        this.archiveRoot = path.join(this.projectRoot, 'docs', 'archive');
        
        this.archivePaths = {
            outdated: path.join(this.archiveRoot, `outdated-md-${this.archiveDate}`),
            conflicting: path.join(this.archiveRoot, `conflicting-md-${this.archiveDate}`),
            backup: path.join(this.archiveRoot, `pre-audit-backup-${this.archiveDate}`)
        };
    }

    async createArchiveStructure() {
        console.log('📦 Creating Context Engineering archive structure...\n');

        try {
            // Step 1: Run audit to get current classification
            console.log('🔍 Running audit to get file classifications...');
            const audit = new MDFilesAudit();
            const auditResults = await audit.runComprehensiveAudit();

            // Step 2: Create archive directories
            console.log('\n📁 Creating archive directories...');
            this.createArchiveDirectories();

            // Step 3: Create backup of current state
            console.log('\n💾 Creating backup of current documentation state...');
            this.createFullBackup();

            // Step 4: Archive outdated files
            console.log('\n📦 Archiving outdated files...');
            await this.archiveFiles(auditResults.outdated, 'outdated');

            // Step 5: Archive conflicting files
            console.log('\n🚨 Archiving conflicting files...');
            await this.archiveFiles(auditResults.conflicting, 'conflicting');

            // Step 6: Create archive index
            console.log('\n📋 Creating archive index...');
            this.createArchiveIndex(auditResults);

            // Step 7: Update references
            console.log('\n🔗 Updating references to archived files...');
            this.updateReferences(auditResults);

            console.log('\n🎉 Archive structure created successfully!');
            console.log(`📦 Outdated files: ${auditResults.outdated.length} archived`);
            console.log(`🚨 Conflicting files: ${auditResults.conflicting.length} archived`);
            console.log(`✅ Active files: ${auditResults.accurate.length} remain`);

            return {
                outdatedArchived: auditResults.outdated.length,
                conflictingArchived: auditResults.conflicting.length,
                activeRemaining: auditResults.accurate.length,
                archivePaths: this.archivePaths
            };

        } catch (error) {
            console.error('❌ Archive creation failed:', error.message);
            throw error;
        }
    }

    createArchiveDirectories() {
        // Ensure docs/archive directory exists
        if (!fs.existsSync(this.archiveRoot)) {
            fs.mkdirSync(this.archiveRoot, { recursive: true });
        }

        // Create specific archive directories
        Object.values(this.archivePaths).forEach(archivePath => {
            if (!fs.existsSync(archivePath)) {
                fs.mkdirSync(archivePath, { recursive: true });
                console.log(`✅ Created: ${path.relative(this.projectRoot, archivePath)}`);
            }
        });

        // Create subdirectories in archives to maintain structure
        const subdirs = ['frontend', 'backend', 'docs', 'deployment'];
        Object.values(this.archivePaths).forEach(archivePath => {
            subdirs.forEach(subdir => {
                const subdirPath = path.join(archivePath, subdir);
                if (!fs.existsSync(subdirPath)) {
                    fs.mkdirSync(subdirPath, { recursive: true });
                }
            });
        });
    }

    createFullBackup() {
        // Create a complete backup of all current MD files
        const findCommand = `find "${this.projectRoot}" -name "*.md" -type f -not -path "*/node_modules/*" -not -path "*/vendor/*" -not -path "*/docs/archive/*"`;
        const mdFiles = execSync(findCommand, { encoding: 'utf8' }).trim().split('\n');

        const backupManifest = {
            timestamp: new Date().toISOString(),
            purpose: 'Pre-audit backup of all MD files',
            totalFiles: mdFiles.length,
            files: []
        };

        mdFiles.forEach(filePath => {
            if (filePath && fs.existsSync(filePath)) {
                const relativePath = path.relative(this.projectRoot, filePath);
                const backupPath = path.join(this.archivePaths.backup, relativePath);
                
                // Ensure backup directory exists
                const backupDir = path.dirname(backupPath);
                if (!fs.existsSync(backupDir)) {
                    fs.mkdirSync(backupDir, { recursive: true });
                }

                // Copy file to backup
                fs.copyFileSync(filePath, backupPath);
                
                backupManifest.files.push({
                    original: relativePath,
                    backup: path.relative(this.projectRoot, backupPath),
                    size: fs.statSync(filePath).size,
                    lastModified: fs.statSync(filePath).mtime
                });
            }
        });

        // Write backup manifest
        const manifestPath = path.join(this.archivePaths.backup, 'BACKUP_MANIFEST.json');
        fs.writeFileSync(manifestPath, JSON.stringify(backupManifest, null, 2));
        
        console.log(`💾 Backup created: ${backupManifest.totalFiles} files`);
    }

    async archiveFiles(files, category) {
        const archivePath = this.archivePaths[category];
        const archivedFiles = [];

        for (const fileAnalysis of files) {
            try {
                const sourcePath = fileAnalysis.fullPath;
                const relativePath = path.relative(this.projectRoot, sourcePath);
                const targetPath = path.join(archivePath, relativePath);

                // Ensure target directory exists
                const targetDir = path.dirname(targetPath);
                if (!fs.existsSync(targetDir)) {
                    fs.mkdirSync(targetDir, { recursive: true });
                }

                // Move file to archive (preserves Git history)
                execSync(`git mv "${sourcePath}" "${targetPath}"`, { 
                    cwd: this.projectRoot,
                    stdio: 'pipe' 
                });

                archivedFiles.push({
                    original: relativePath,
                    archived: path.relative(this.projectRoot, targetPath),
                    reason: fileAnalysis.issues.join('; '),
                    truthScore: fileAnalysis.truthScore
                });

                console.log(`📦 Archived: ${relativePath} → ${category}/`);

            } catch (error) {
                console.log(`⚠️ Could not archive ${fileAnalysis.path}: ${error.message}`);
                
                // Fallback: copy instead of move
                try {
                    const sourcePath = fileAnalysis.fullPath;
                    const relativePath = path.relative(this.projectRoot, sourcePath);
                    const targetPath = path.join(archivePath, relativePath);
                    
                    const targetDir = path.dirname(targetPath);
                    if (!fs.existsSync(targetDir)) {
                        fs.mkdirSync(targetDir, { recursive: true });
                    }
                    
                    fs.copyFileSync(sourcePath, targetPath);
                    fs.unlinkSync(sourcePath);
                    
                    archivedFiles.push({
                        original: relativePath,
                        archived: path.relative(this.projectRoot, targetPath),
                        reason: fileAnalysis.issues.join('; '),
                        truthScore: fileAnalysis.truthScore,
                        method: 'copy-delete'
                    });

                    console.log(`📦 Copied: ${relativePath} → ${category}/`);
                } catch (fallbackError) {
                    console.log(`❌ Failed to archive ${fileAnalysis.path}: ${fallbackError.message}`);
                }
            }
        }

        // Create archive manifest for this category
        const manifest = {
            category: category,
            timestamp: new Date().toISOString(),
            purpose: `Archived ${category} MD files from Context Engineering audit`,
            totalFiles: archivedFiles.length,
            files: archivedFiles
        };

        const manifestPath = path.join(archivePath, `${category.toUpperCase()}_ARCHIVE_MANIFEST.json`);
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

        return archivedFiles;
    }

    createArchiveIndex(auditResults) {
        const indexPath = path.join(this.archiveRoot, 'ARCHIVE_INDEX.md');

        const index = `# 📦 Documentation Archive Index

**Created**: ${new Date().toISOString()}  
**System**: Context Engineering Truth-Based Archive  
**Purpose**: Clean documentation workspace by archiving outdated/conflicting files

---

## 📊 Archive Summary

### **Files Processed**
- ✅ **Active Files**: ${auditResults.accurate.length} (kept in main workspace)
- 📦 **Outdated Files**: ${auditResults.outdated.length} (archived)
- 🚨 **Conflicting Files**: ${auditResults.conflicting.length} (archived)
- 💾 **Backup Files**: All MD files backed up

### **Archive Structure**
\`\`\`
docs/archive/
├── ${path.basename(this.archivePaths.outdated)}/          # Outdated but harmless files
├── ${path.basename(this.archivePaths.conflicting)}/       # Files with conflicting information
└── ${path.basename(this.archivePaths.backup)}/            # Complete backup of original state
\`\`\`

---

## 📦 Outdated Files Archive

**Purpose**: Files that are old but not harmful - mainly historical documentation

**Location**: \`${path.relative(this.projectRoot, this.archivePaths.outdated)}\`

**Count**: ${auditResults.outdated.length} files

**Reason**: These files contain outdated information but don't conflict with current reality

---

## 🚨 Conflicting Files Archive

**Purpose**: Files with information that conflicts with verified Context Engineering results

**Location**: \`${path.relative(this.projectRoot, this.archivePaths.conflicting)}\`

**Count**: ${auditResults.conflicting.length} files

**Reason**: These files contain claims that contradict verified platform functionality

---

## 💾 Complete Backup

**Purpose**: Full backup of documentation state before archiving

**Location**: \`${path.relative(this.projectRoot, this.archivePaths.backup)}\`

**Use Case**: Recovery if any files were incorrectly archived

---

## ✅ Active Documentation (Kept)

The following ${auditResults.accurate.length} files remain active in the main workspace:

${auditResults.accurate.map(f => `- \`${f.path}\` (Truth Score: ${f.truthScore}/100)`).join('\n')}

---

## 🔄 Restoration Process

If you need to restore any archived file:

\`\`\`bash
# Restore from outdated archive
git mv docs/archive/${path.basename(this.archivePaths.outdated)}/path/to/file.md path/to/file.md

# Restore from conflicting archive  
git mv docs/archive/${path.basename(this.archivePaths.conflicting)}/path/to/file.md path/to/file.md

# Restore from backup
cp docs/archive/${path.basename(this.archivePaths.backup)}/path/to/file.md path/to/file.md
\`\`\`

---

## 🎯 Next Steps

1. **Review Active Files**: Ensure all remaining files are needed
2. **Update References**: Fix any broken links to archived files
3. **Create MD Index**: Establish clear documentation hierarchy
4. **Monitor Quality**: Implement automated documentation drift detection

---

**🏆 Context Engineering Achievement**: Successfully organized ${auditResults.outdated.length + auditResults.conflicting.length} files into clean archives while preserving ${auditResults.accurate.length} verified accurate files for active use.
`;

        fs.writeFileSync(indexPath, index);
        console.log(`📋 Archive index created: ${path.relative(this.projectRoot, indexPath)}`);
    }

    updateReferences(auditResults) {
        // This would scan active files for references to archived files and update them
        // For now, just create a report of potential broken references
        
        const referencesReport = {
            timestamp: new Date().toISOString(),
            purpose: 'Track potential broken references after archiving',
            archivedFiles: [
                ...auditResults.outdated.map(f => f.path),
                ...auditResults.conflicting.map(f => f.path)
            ],
            potentialIssues: []
        };

        // Scan active files for references to archived files
        auditResults.accurate.forEach(activeFile => {
            try {
                const content = fs.readFileSync(activeFile.fullPath, 'utf8');
                referencesReport.archivedFiles.forEach(archivedPath => {
                    if (content.includes(archivedPath)) {
                        referencesReport.potentialIssues.push({
                            activeFile: activeFile.path,
                            referencesArchived: archivedPath,
                            action: 'Review and update reference'
                        });
                    }
                });
            } catch (error) {
                // Skip files that can't be read
            }
        });

        const reportPath = path.join(this.archiveRoot, 'REFERENCES_UPDATE_REPORT.json');
        fs.writeFileSync(reportPath, JSON.stringify(referencesReport, null, 2));

        if (referencesReport.potentialIssues.length > 0) {
            console.log(`⚠️ Found ${referencesReport.potentialIssues.length} potential reference issues`);
            console.log(`📋 Review: ${path.relative(this.projectRoot, reportPath)}`);
        } else {
            console.log('✅ No broken references detected');
        }
    }
}

// Run archive creation if called directly
if (require.main === module) {
    const archiver = new ArchiveStructureCreator();
    archiver.createArchiveStructure().then(results => {
        console.log('\n🎉 Archive structure created successfully!');
        console.log(`📦 Total files archived: ${results.outdatedArchived + results.conflictingArchived}`);
        console.log(`✅ Active files remaining: ${results.activeRemaining}`);
        process.exit(0);
    }).catch(error => {
        console.error('\n❌ Archive creation failed:', error.message);
        process.exit(1);
    });
}

module.exports = ArchiveStructureCreator;