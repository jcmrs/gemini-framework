const fs = require('fs');
const path = require('path');

class StateManager {
    constructor(statePath) {
        this.statePath = statePath;
        this.state = this.load();
    }

    load() {
        if (fs.existsSync(this.statePath)) {
            try {
                return JSON.parse(fs.readFileSync(this.statePath, 'utf8'));
            } catch (e) {
                console.error('Failed to load state, resetting.');
            }
        }
        return this.getDefaultState();
    }

    getDefaultState() {
        return {
            session: {
                uuid: '',
                start_time: '',
                last_interaction: ''
            },
            framework: {
                adoption_cycle: 'Getting Started',
                impulse_counts: {
                    collaboration: 0,
                    communication: 0,
                    execution: 0,
                    formatting: 0,
                    performance: 0,
                    speed: 0,
                    validation: 0
                },
                feeling_counts: {
                    negative: 0,
                    positive: 0
                }
            },
            context: {
                last_summary: ''
            }
        };
    }

    save() {
        fs.writeFileSync(this.statePath, JSON.stringify(this.state, null, 2));
    }

    updateCycle(impulseCount) {
        // Simple heuristic: If impulses are consistently low, move up.
        // If high, stay or move down.
        // This is a placeholder for the "Psychologist" logic.
        const current = this.state.framework.adoption_cycle;
        
        if (impulseCount > 5 && current !== 'Getting Started') {
            this.state.framework.adoption_cycle = 'Getting Started'; // Regression
        } else if (impulseCount < 2 && current === 'Getting Started') {
            this.state.framework.adoption_cycle = 'Working Naturally'; // Progression
        }
        // More logic would go here for 'Fully Integrated'
        this.save();
    }
}

module.exports = StateManager;
