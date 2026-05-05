/**
 * Savings Goals Module - Track savings targets
 */
const Goals = {
    STORAGE_KEY: 'finance_goals',

    /**
     * Get all goals
     */
    getAll() {
        return Storage.get(this.STORAGE_KEY) || [];
    },

    /**
     * Save all goals
     */
    saveAll(goals) {
        Storage.set(this.STORAGE_KEY, goals);
        if(typeof WizeAISync!=='undefined') WizeAISync.scheduleSync();
    },

    /**
     * Add a new goal
     */
    add(goal) {
        const goals = this.getAll();
        goal.id = Storage.generateId();
        goal.createdAt = new Date().toISOString();
        goal.currentAmount = goal.currentAmount || 0;
        goals.push(goal);
        this.saveAll(goals);
        return goal;
    },

    /**
     * Update a goal
     */
    update(id, updates) {
        const goals = this.getAll();
        const index = goals.findIndex(g => g.id === id);
        if (index !== -1) {
            goals[index] = { ...goals[index], ...updates };
            this.saveAll(goals);
            return goals[index];
        }
        return null;
    },

    /**
     * Delete a goal
     */
    delete(id) {
        const goals = this.getAll().filter(g => g.id !== id);
        this.saveAll(goals);
    },

    /**
     * Add amount to goal
     */
    addAmount(id, amount) {
        const goals = this.getAll();
        const goal = goals.find(g => g.id === id);
        if (goal) {
            goal.currentAmount = (goal.currentAmount || 0) + amount;
            goal.history = goal.history || [];
            goal.history.push({
                date: new Date().toISOString(),
                amount,
                total: goal.currentAmount
            });
            this.saveAll(goals);
            return goal;
        }
        return null;
    },

    /**
     * Calculate goal progress
     */
    getProgress(goal) {
        const percentage = goal.targetAmount > 0
            ? (goal.currentAmount / goal.targetAmount) * 100
            : 0;

        const remaining = goal.targetAmount - goal.currentAmount;

        // Calculate monthly needed if deadline exists
        let monthlyNeeded = 0;
        if (goal.deadline) {
            const now = new Date();
            const deadline = new Date(goal.deadline);
            const monthsLeft = Math.max(1,
                (deadline.getFullYear() - now.getFullYear()) * 12 +
                (deadline.getMonth() - now.getMonth())
            );
            monthlyNeeded = remaining > 0 ? remaining / monthsLeft : 0;
        }

        return {
            percentage: Math.min(100, percentage),
            remaining: Math.max(0, remaining),
            monthlyNeeded,
            isComplete: percentage >= 100
        };
    },

    /**
     * Get summary of all goals
     */
    getSummary() {
        const goals = this.getAll();
        const active = goals.filter(g => !this.getProgress(g).isComplete);
        const completed = goals.filter(g => this.getProgress(g).isComplete);

        const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
        const totalCurrent = goals.reduce((sum, g) => sum + g.currentAmount, 0);

        return {
            total: goals.length,
            active: active.length,
            completed: completed.length,
            totalTarget,
            totalCurrent,
            overallProgress: totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0
        };
    }
};

// Make available globally
window.Goals = Goals;
