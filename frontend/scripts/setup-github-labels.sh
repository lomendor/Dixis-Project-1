#!/bin/bash

# GitHub Labels Setup Script for Dixis Fresh
# Creates professional label system for enterprise development tracking

set -e

echo "🏷️  Setting up GitHub labels for Dixis Fresh..."

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    print_warning "GitHub CLI not found. Please install it first:"
    echo "  brew install gh"
    echo "  gh auth login"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    print_warning "Please authenticate with GitHub CLI first:"
    echo "  gh auth login"
    exit 1
fi

print_status "Creating Priority Labels..."

# Priority Labels
gh label create "critical" --color "d73a4a" --description "🔴 Blocking/urgent issues" --force
gh label create "high" --color "ff6600" --description "🟠 Important for user experience" --force  
gh label create "medium" --color "ffcc00" --description "🟡 Normal priority" --force
gh label create "low" --color "28a745" --description "🟢 Nice to have" --force

print_status "Creating Type Labels..."

# Type Labels
gh label create "bug" --color "d73a4a" --description "🐛 Bug fixes" --force
gh label create "feature" --color "28a745" --description "✨ New features" --force
gh label create "enterprise" --color "7057ff" --description "🏢 Enterprise integrations" --force
gh label create "documentation" --color "0075ca" --description "📚 Documentation updates" --force
gh label create "performance" --color "ff6600" --description "⚡ Performance improvements" --force
gh label create "infrastructure" --color "6f42c1" --description "🔧 DevOps/deployment" --force
gh label create "testing" --color "ffc107" --description "🧪 Testing improvements" --force

print_status "Creating Size Labels..."

# Size Labels
gh label create "XS" --color "c5f015" --description "1-2 hours" --force
gh label create "S" --color "84c5ff" --description "1-2 days" --force
gh label create "M" --color "ffcc00" --description "3-5 days" --force
gh label create "L" --color "ff6600" --description "1-2 weeks" --force
gh label create "XL" --color "d73a4a" --description "2+ weeks" --force

print_status "Creating Module Labels..."

# Module Labels
gh label create "frontend" --color "61dafb" --description "React/Next.js components" --force
gh label create "backend" --color "ff2d20" --description "Laravel/PHP backend" --force
gh label create "mobile" --color "32de84" --description "PWA/Mobile features" --force
gh label create "admin" --color "6f42c1" --description "Admin panel features" --force
gh label create "integrations" --color "ff6600" --description "External API integrations" --force
gh label create "analytics" --color "0075ca" --description "Analytics/BI features" --force
gh label create "devops" --color "6e7681" --description "DevOps/Infrastructure" --force

print_status "Creating Business Labels..."

# Business Value Labels
gh label create "revenue-impact" --color "28a745" --description "💰 Direct revenue impact" --force
gh label create "customer-acquisition" --color "17a2b8" --description "👥 Customer acquisition feature" --force
gh label create "competitive-advantage" --color "6f42c1" --description "🚀 Competitive advantage" --force

print_status "Cleaning up default labels..."

# Remove default labels that we don't need
default_labels=("enhancement" "good first issue" "help wanted" "question" "wontfix" "duplicate" "invalid")

for label in "${default_labels[@]}"; do
    gh label delete "$label" --yes 2>/dev/null || print_warning "Label '$label' not found (already deleted)"
done

print_status "✅ GitHub labels setup complete!"

echo ""
echo "📊 Labels Created:"
echo "  🔴 Priority: critical, high, medium, low"
echo "  🏷️  Type: bug, feature, enterprise, documentation, performance, infrastructure, testing"
echo "  📏 Size: XS, S, M, L, XL"
echo "  🏗️  Module: frontend, backend, mobile, admin, integrations, analytics, devops"
echo "  💼 Business: revenue-impact, customer-acquisition, competitive-advantage"

echo ""
print_status "Next steps:"
echo "1. Create project board: gh project create --title 'Dixis Enterprise Development'"
echo "2. Create issues from GITHUB_ISSUES_TO_CREATE.md"
echo "3. Set up milestones for sprints"