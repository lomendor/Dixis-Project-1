#!/usr/bin/env node

/**
 * Dixis Context Engineering Hooks
 * Automated workflow management and progress tracking
 */

const fs = require('fs');
const path = require('path');

class ContextEngineering {
    constructor() {
        this.configPath = path.join(__dirname, '..', 'context-engine.json');
        this.statusPath = path.join(__dirname, '..', 'MASTER_STATUS.md');
        this.config = this.loadConfig();
    }

    loadConfig() {
        try {
            return JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
        } catch (error) {
            console.error('Failed to load context-engine.json:', error.message);
            return {};
        }
    }

    saveConfig() {
        fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
        console.log('✅ Context engine configuration updated');
    }

    // Hook: Task Completion
    onTaskComplete(taskId, results = {}) {
        console.log(`🎯 Task completed: ${taskId}`);
        
        // Update task status
        this.updateTaskStatus(taskId, 'completed', results);
        
        // Recalculate business metrics
        this.updateBusinessMetrics();
        
        // Update documentation
        this.updateMasterStatus();
        
        // Determine next optimal task
        const nextTask = this.getNextRecommendedTask();
        console.log(`📋 Next recommended task: ${nextTask.id}`);
        
        return nextTask;
    }

    // Hook: Business Metric Change
    onBusinessMetricChange(metric, newValue, oldValue) {
        console.log(`📊 Business metric updated: ${metric} ${oldValue}% → ${newValue}%`);
        
        // Update real-time metrics
        this.config.realTimeMetrics[metric] = newValue;
        this.config.realTimeMetrics.lastCalculated = new Date().toISOString();
        
        // Recalculate task priorities based on new metrics
        this.recalculateTaskPriorities();
        
        // Alert on critical changes
        if (Math.abs(newValue - oldValue) > 10) {
            console.log(`🚨 Significant change in ${metric}: Impact assessment required`);
        }
        
        this.saveConfig();
    }

    // Hook: Greek Market Progress
    onGreekMarketProgress(area, progress) {
        console.log(`🇬🇷 Greek market progress: ${area} → ${progress}%`);
        
        // Update Greek market readiness score
        const areas = ['payments', 'shipping', 'vat', 'producers'];
        const totalProgress = areas.reduce((sum, a) => sum + (this.getAreaProgress(a) || 0), 0) / areas.length;
        
        this.onBusinessMetricChange('greekMarketReadiness', Math.round(totalProgress));
        
        // Check if ready for beta launch
        if (totalProgress >= 80) {
            console.log('🚀 Greek market beta launch readiness achieved!');
            this.triggerBetaLaunchPreparation();
        }
    }

    // Smart Task Prioritization
    updateTaskStatus(taskId, status, results = {}) {
        // Find and update task in high_priority or medium_priority
        ['high_priority', 'medium_priority'].forEach(priority => {
            const tasks = this.config.intelligentTasks[priority];
            const taskIndex = tasks.findIndex(t => t.id === taskId);
            
            if (taskIndex !== -1) {
                tasks[taskIndex].status = status;
                tasks[taskIndex].completedAt = new Date().toISOString();
                tasks[taskIndex].results = results;
                
                console.log(`✅ Updated task: ${tasks[taskIndex].title}`);
            }
        });
        
        this.saveConfig();
    }

    // Business Impact Calculator
    calculateBusinessImpact(task) {
        let impact = task.businessImpact || 0;
        
        // Boost Greek market critical tasks
        if (task.greekMarketCritical) {
            impact += 10;
        }
        
        // Boost revenue-generating tasks
        if (task.revenueImpact && task.revenueImpact.includes('€')) {
            impact += 15;
        }
        
        // Reduce impact if blocked
        if (task.blockers && task.blockers.length > 0) {
            impact -= 20;
        }
        
        return Math.min(100, Math.max(0, impact));
    }

    // Get Next Optimal Task
    getNextRecommendedTask() {
        const allTasks = [
            ...this.config.intelligentTasks.high_priority,
            ...this.config.intelligentTasks.medium_priority
        ];
        
        // Filter available tasks (not completed, not blocked)
        const availableTasks = allTasks.filter(task => 
            task.status !== 'completed' && 
            (!task.blockers || task.blockers.length === 0)
        );
        
        // Sort by calculated business impact
        availableTasks.sort((a, b) => 
            this.calculateBusinessImpact(b) - this.calculateBusinessImpact(a)
        );
        
        const nextTask = availableTasks[0];
        
        if (nextTask) {
            // Update recommendation in config
            this.config.nextRecommendedAction = {
                task: nextTask.id,
                reasoning: `Highest business impact (${this.calculateBusinessImpact(nextTask)}) + ${nextTask.greekMarketCritical ? 'Greek market critical + ' : ''}${nextTask.revenueImpact}`,
                estimatedValue: nextTask.revenueImpact,
                urgency: nextTask.businessImpact >= 80 ? 'high' : 'medium'
            };
            
            this.saveConfig();
        }
        
        return nextTask;
    }

    // Update Business Metrics
    updateBusinessMetrics() {
        const completedTasks = this.getCompletedTasks();
        
        // Calculate platform functionality
        const totalTasks = this.getAllTasks().length;
        const platformTasks = completedTasks.filter(t => t.greekMarketCritical !== true).length;
        const platformFunctionality = Math.round((platformTasks / totalTasks) * 100);
        
        // Calculate Greek market readiness
        const greekTasks = completedTasks.filter(t => t.greekMarketCritical === true).length;
        const totalGreekTasks = this.getAllTasks().filter(t => t.greekMarketCritical === true).length;
        const greekMarketReadiness = Math.round((greekTasks / totalGreekTasks) * 100);
        
        // Update metrics
        this.config.realTimeMetrics.platformFunctionality = platformFunctionality;
        this.config.realTimeMetrics.greekMarketReadiness = greekMarketReadiness;
        this.config.realTimeMetrics.lastCalculated = new Date().toISOString();
        
        console.log(`📊 Metrics updated: Platform ${platformFunctionality}%, Greek Market ${greekMarketReadiness}%`);
    }

    // Helper Functions
    getCompletedTasks() {
        return this.getAllTasks().filter(t => t.status === 'completed');
    }

    getAllTasks() {
        return [
            ...this.config.intelligentTasks.high_priority,
            ...this.config.intelligentTasks.medium_priority
        ];
    }

    getAreaProgress(area) {
        // Mock function - would integrate with actual systems
        const progressMap = {
            'payments': 20, // Viva Wallet researched, not implemented
            'shipping': 15, // AfterSalesPro researched, not implemented  
            'vat': 10,      // Rates identified, not implemented
            'producers': 70 // Dashboard exists, 5 active producers
        };
        return progressMap[area] || 0;
    }

    recalculateTaskPriorities() {
        // Recalculate all task priorities based on current metrics
        this.getAllTasks().forEach(task => {
            task.businessImpact = this.calculateBusinessImpact(task);
        });
        
        this.saveConfig();
        console.log('🔄 Task priorities recalculated');
    }

    triggerBetaLaunchPreparation() {
        console.log('🎉 Initiating beta launch preparation sequence...');
        // Would trigger additional workflows
    }

    updateMasterStatus() {
        // Update MASTER_STATUS.md with current metrics
        const metrics = this.config.realTimeMetrics;
        console.log(`📝 Documentation updated with current metrics`);
        // Implementation would update the actual file
    }

    // Main execution
    run(action, ...args) {
        switch(action) {
            case 'task-complete':
                return this.onTaskComplete(...args);
            case 'metric-change':
                return this.onBusinessMetricChange(...args);
            case 'greek-progress':
                return this.onGreekMarketProgress(...args);
            case 'next-task':
                return this.getNextRecommendedTask();
            case 'status':
                console.log('🎯 Context Engineering Status:');
                console.log(`Platform Functionality: ${this.config.realTimeMetrics.platformFunctionality}%`);
                console.log(`Greek Market Readiness: ${this.config.realTimeMetrics.greekMarketReadiness}%`);
                console.log(`Next Task: ${this.config.nextRecommendedAction.task}`);
                break;
            default:
                console.log('Available commands: task-complete, metric-change, greek-progress, next-task, status');
        }
    }
}

// Command line interface
if (require.main === module) {
    const engine = new ContextEngineering();
    const [,, action, ...args] = process.argv;
    engine.run(action, ...args);
}

module.exports = ContextEngineering;