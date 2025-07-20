# 📋 GitHub Project Board Setup Guide

## 🎯 Project Board Structure

### **Board Name**: "Dixis Platform Development"
**Description**: Agile development board for Dixis farm-to-table marketplace

### **Column Configuration**

#### 📥 **Backlog** 
- **Purpose**: All approved issues waiting to be prioritized
- **Automation**: Issues automatically added when created
- **Definition**: Features/bugs that are documented but not yet planned

#### 🎯 **Sprint Ready**
- **Purpose**: Issues planned for current/next sprint  
- **Automation**: Manual move from Backlog after sprint planning
- **Definition**: Issues with clear acceptance criteria and effort estimates

#### 🚧 **In Progress**
- **Purpose**: Active development work
- **Automation**: Move here when issue assigned + PR linked
- **Definition**: Developer actively working on implementation

#### 👀 **In Review** 
- **Purpose**: Code review and testing phase
- **Automation**: Move here when PR created
- **Definition**: Code complete, awaiting review and approval

#### 🧪 **Testing**
- **Purpose**: QA validation and user acceptance testing
- **Automation**: Move here when PR merged to develop
- **Definition**: Feature deployed to staging, ready for testing

#### ✅ **Done**
- **Purpose**: Completed and verified work
- **Automation**: Move here when issue closed
- **Definition**: Feature tested, approved, and deployed to production

### **Custom Fields**

#### **Priority** (Single Select)
- 🔴 Critical - Blocks core functionality
- 🟠 High - Important for user experience  
- 🟡 Medium - Nice to have improvements
- 🟢 Low - Future enhancements

#### **Effort** (Single Select)
- XS (1-2 hours)
- S (2-4 hours)
- M (5-8 hours) 
- L (8-12 hours)
- XL (12+ hours - needs breakdown)

#### **Module** (Single Select)
- Consumer E-commerce
- Producer Portal
- Admin Dashboard
- B2B Platform
- API/Backend
- Infrastructure

#### **Sprint** (Single Select)
- Sprint 1 - Critical Stability
- Sprint 2 - Enhanced UX
- Sprint 3 - Mobile & Performance
- Backlog

## 🔄 Workflow Automation Rules

### **Issue Creation**
```yaml
Trigger: Issue created
Action: Add to "Backlog" column
```

### **Sprint Planning**
```yaml
Trigger: Manual move to "Sprint Ready"
Action: Add sprint label, assign milestone
```

### **Development Start**
```yaml
Trigger: Issue assigned + branch created
Action: Move to "In Progress"
```

### **Code Review**
```yaml
Trigger: Pull request opened and linked to issue
Action: Move to "In Review"
```

### **Testing Phase**
```yaml
Trigger: Pull request merged to develop
Action: Move to "Testing"
```

### **Completion**
```yaml
Trigger: Issue closed
Action: Move to "Done", add "verified" label
```

## 🏷️ Label Strategy

### **Type Labels** (Required)
- `type:bug` 🐛 - Red
- `type:feature` 🚀 - Green  
- `type:enhancement` ✨ - Blue
- `type:technical-debt` ⚙️ - Yellow
- `type:documentation` 📚 - Purple

### **Priority Labels** (Required)
- `priority:critical` 🔴 - Dark Red
- `priority:high` 🟠 - Orange
- `priority:medium` 🟡 - Yellow
- `priority:low` 🟢 - Green

### **Module Labels** (Required)
- `module:consumer` 🛒 - Blue
- `module:producer` 🌱 - Green
- `module:admin` 👑 - Purple
- `module:b2b` 💼 - Orange
- `module:api` 🔌 - Gray
- `module:infrastructure` 🏗️ - Brown

### **Status Labels** (Auto-applied)
- `status:in-progress` 🚧 - Yellow
- `status:in-review` 👀 - Orange  
- `status:testing` 🧪 - Blue
- `status:blocked` 🚫 - Red
- `status:verified` ✅ - Green

### **Effort Labels** (Planning)
- `effort:XS` - Light Gray
- `effort:S` - Gray
- `effort:M` - Dark Gray
- `effort:L` - Black
- `effort:XL` - Red (needs breakdown)

## 📊 Project Views

### **1. Sprint Board** (Default View)
- **Filter**: Current sprint items only
- **Group by**: Column (Backlog → Done)
- **Sort**: Priority (Critical → Low)

### **2. Team Workload**
- **Group by**: Assignee
- **Filter**: In Progress + In Review
- **Sort**: Due date

### **3. Module Overview**
- **Group by**: Module label
- **Filter**: Open issues only
- **Sort**: Priority

### **4. Bug Triage**
- **Filter**: type:bug, Open
- **Group by**: Priority
- **Sort**: Created date (oldest first)

### **5. Release Planning**
- **Filter**: Milestone assigned
- **Group by**: Milestone
- **Sort**: Priority

## ⚙️ Integration Setup

### **GitHub Actions Integration**
```yaml
# Automatically update project board on PR events
name: Update Project Board
on:
  pull_request:
    types: [opened, closed, merged]
  issues:
    types: [opened, closed, assigned]
```

### **Slack Notifications** (Optional)
- Sprint milestone updates
- Critical issue assignments  
- PR review requests
- Release deployments

## 📈 Metrics & Reporting

### **Sprint Metrics**
- **Velocity**: Story points completed per sprint
- **Cycle Time**: Days from In Progress → Done
- **Lead Time**: Days from Backlog → Done
- **Burndown**: Remaining work in current sprint

### **Quality Metrics**
- **Bug Rate**: Bugs created vs features delivered
- **Rework Rate**: Issues reopened after closing
- **Review Time**: Hours in Review column
- **Test Pass Rate**: Issues passing QA first time

### **Team Metrics**
- **Workload Distribution**: Issues per team member
- **Specialization**: Work distribution by module
- **Collaboration**: Cross-module issue participation

## 🚀 Sprint Planning Process

### **Weekly Sprint Planning** (Fridays)
1. **Review completed work** from current sprint
2. **Prioritize backlog** based on business value
3. **Estimate effort** for new issues
4. **Assign issues** to Sprint Ready column
5. **Set sprint milestone** and due dates

### **Daily Standups** (Optional)
1. **What did you complete** yesterday?
2. **What are you working on** today?
3. **Are there any blockers** preventing progress?
4. **Update issue status** in project board

### **Sprint Review** (End of Sprint)
1. **Demo completed features** to stakeholders
2. **Review metrics** and team performance
3. **Retrospective** - what went well/poorly
4. **Plan improvements** for next sprint

## 🎯 Success Criteria

### **Project Board Adoption**
- ✅ All development work tracked in issues
- ✅ Board updated within 24 hours of status changes
- ✅ Sprint planning completed weekly
- ✅ Metrics reviewed monthly

### **Quality Improvements** 
- ✅ Reduced emergency fixes (< 10% of work)
- ✅ Improved estimation accuracy (±20%)
- ✅ Faster review cycles (< 2 days average)
- ✅ Higher first-time QA pass rate (> 80%)

---

**Next Steps**: 
1. Create GitHub project board with these settings
2. Import initial issues from INITIAL_GITHUB_ISSUES.md
3. Set up automation rules and custom fields
4. Train team on new workflow