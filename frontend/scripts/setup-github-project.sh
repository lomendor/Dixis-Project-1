#!/bin/bash

# GitHub Project Board Setup Script for Dixis Fresh
# Creates professional project board for enterprise development tracking

set -e

echo "📋 Setting up GitHub Project Board for Dixis Fresh..."

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_note() {
    echo -e "${BLUE}[NOTE]${NC} $1"
}

# Check if gh CLI is installed and authenticated
if ! command -v gh &> /dev/null; then
    print_warning "GitHub CLI not found. Please install it first:"
    echo "  brew install gh"
    echo "  gh auth login"
    exit 1
fi

if ! gh auth status &> /dev/null; then
    print_warning "Please authenticate with GitHub CLI first:"
    echo "  gh auth login"
    exit 1
fi

print_status "Creating project board..."

# Create the project board
PROJECT_URL=$(gh project create \
    --title "Dixis Enterprise Development" \
    --body "Professional development tracking for €300K+ enterprise feature integration

## Sprint Structure
- **Sprint 1**: B2B Marketplace (€80K+ value)
- **Sprint 2**: Enterprise Integrations (€95K+ value)  
- **Sprint 3**: Mobile PWA Platform (€75K+ value)
- **Sprint 4**: Admin & Security (€65K+ value)
- **Sprint 5**: Quality & Advanced Features (€135K+ value)

## Success Metrics
- All enterprise features integrated
- Revenue potential: €200K-500K annually
- Technical debt addressed
- Production deployment verified" \
    --format=url)

print_status "Project board created: $PROJECT_URL"

print_status "Creating milestones..."

# Create milestones for sprints
MILESTONE_DATE=$(date -j -f "%Y-%m-%d" -v +1w "$(date +%Y-%m-%d)" "+%Y-%m-%d")

gh api repos/:owner/:repo/milestones \
    --method POST \
    --field title="Sprint 1 - Enterprise Foundation" \
    --field description="B2B Marketplace Integration (€80K+ value)
    
Key Deliverables:
- Enterprise B2B marketplace system operational
- GitHub organization completed  
- Production deployment finalized
- Foundation for enterprise features

Timeline: Week 1
Business Impact: €70K-€290K annual revenue potential" \
    --field due_on="${MILESTONE_DATE}T23:59:59Z" \
    --field state="open" > /dev/null

# Sprint 2
MILESTONE_DATE=$(date -j -f "%Y-%m-%d" -v +2w "$(date +%Y-%m-%d)" "+%Y-%m-%d")
gh api repos/:owner/:repo/milestones \
    --method POST \
    --field title="Sprint 2 - Enterprise Integrations" \
    --field description="Accounting & CRM Integrations (€95K+ value)

Key Deliverables:
- QuickBooks & Xero integration
- CRM & Marketing automation
- ML recommendation engine
- Automated business operations

Timeline: Week 2
Business Impact: Automated accounting and customer management" \
    --field due_on="${MILESTONE_DATE}T23:59:59Z" \
    --field state="open" > /dev/null

# Sprint 3  
MILESTONE_DATE=$(date -j -f "%Y-%m-%d" -v +3w "$(date +%Y-%m-%d)" "+%Y-%m-%d")
gh api repos/:owner/:repo/milestones \
    --method POST \
    --field title="Sprint 3 - Mobile PWA Platform" \
    --field description="Mobile PWA System (€75K+ value)

Key Deliverables:
- PWA with offline functionality
- Native mobile experience
- Push notifications
- App store readiness

Timeline: Week 3  
Business Impact: +40% mobile conversion rate" \
    --field due_on="${MILESTONE_DATE}T23:59:59Z" \
    --field state="open" > /dev/null

# Sprint 4
MILESTONE_DATE=$(date -j -f "%Y-%m-%d" -v +4w "$(date +%Y-%m-%d)" "+%Y-%m-%d")
gh api repos/:owner/:repo/milestones \
    --method POST \
    --field title="Sprint 4 - Admin & Security Platform" \
    --field description="Admin Security & Inventory (€65K+ value)

Key Deliverables:
- Enterprise admin authentication
- Advanced inventory management  
- RBAC and security monitoring
- Multi-factor authentication

Timeline: Week 4
Business Impact: Enterprise-grade security and operations" \
    --field due_on="${MILESTONE_DATE}T23:59:59Z" \
    --field state="open" > /dev/null

# Sprint 5
MILESTONE_DATE=$(date -j -f "%Y-%m-%d" -v +5w "$(date +%Y-%m-%d)" "+%Y-%m-%d")
gh api repos/:owner/:repo/milestones \
    --method POST \
    --field title="Sprint 5 - Quality & Advanced Features" \
    --field description="Testing & Multi-tenant Platform (€135K+ value)

Key Deliverables:
- E2E testing suite
- Multi-tenant platform
- Advanced analytics & BI
- Greek logistics integration
- Production monitoring

Timeline: Week 5
Business Impact: Enterprise platform with multi-tenancy" \
    --field due_on="${MILESTONE_DATE}T23:59:59Z" \
    --field state="open" > /dev/null

print_status "✅ Milestones created for all 5 sprints"

print_status "Setting up project board automation..."

print_note "Manual steps required:"
echo ""
echo "1. 🌐 Open project board: $PROJECT_URL"
echo ""
echo "2. 📋 Configure columns:"
echo "   - 📥 Backlog (for new issues)"
echo "   - 🎯 Sprint Ready (prioritized for current sprint)" 
echo "   - 🔄 In Progress (currently being worked on)"
echo "   - 👀 In Review (PR submitted/code review)"
echo "   - ✅ Done (completed and merged)"
echo ""
echo "3. ⚙️  Set up automation:"
echo "   - Auto-move items to 'In Progress' when assigned"
echo "   - Auto-move to 'In Review' when PR is opened"
echo "   - Auto-move to 'Done' when PR is merged"
echo ""
echo "4. 📊 Add issues from GITHUB_ISSUES_TO_CREATE.md"
echo ""

print_status "Next actions:"
echo "1. Run: ./scripts/setup-github-labels.sh (if not done already)"
echo "2. Create issues from GITHUB_ISSUES_TO_CREATE.md"
echo "3. Assign issues to Sprint 1 milestone"
echo "4. Move top 5 issues to 'Sprint Ready' column"

echo ""
print_status "🎉 Project setup foundation complete!"
echo ""
echo "📈 Business Value Summary:"
echo "  💰 Total Integration Value: €450K+"
echo "  📅 Timeline: 5 weeks / 5 sprints"
echo "  🎯 Revenue Potential: €200K-500K annually"
echo "  🚀 ROI: 4-10x revenue increase"