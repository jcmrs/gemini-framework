const fs = require('fs');
const path = require('path');

class Hippocampus {
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

    /**
     * The "Psychologist" Logic
     * Analyzes the impulse/feeling counts from the previous turn and adjusts the Cycle.
     */
    consolidate(metrics) {
        // Update cumulative counts
        if (metrics.impulses) {
            for (const [key, count] of Object.entries(metrics.impulses)) {
                this.state.framework.impulse_counts[key] = (this.state.framework.impulse_counts[key] || 0) + count;
            }
        }
        
        // Adjust Adoption Cycle
        // Logic: 
        // - High impulses in "Getting Started" -> Stay (Honest detection is good).
        // - Low impulses in "Getting Started" -> Move to "Working Naturally" (Integration).
        // - High impulses in "Working Naturally" -> Move back to "Getting Started" (Regression/Stress).
        
        const current = this.state.framework.adoption_cycle;
        const totalImpulses = Object.values(metrics.impulses || {}).reduce((a, b) => a + b, 0);

        if (current === 'Getting Started') {
            if (totalImpulses < 2) {
                // Potential progression
                console.error('[Hippocampus] Low impulse count detected. Considering progression...');
                // In a real system, we'd wait for N sessions of stability.
                // For this prototype, we progress immediately to demonstrate dynamics.
                this.state.framework.adoption_cycle = 'Working Naturally';
            }
        } else if (current === 'Working Naturally') {
            if (totalImpulses > 5) {
                console.error('[Hippocampus] High impulse count detected. Regressing scaffolding.');
                this.state.framework.adoption_cycle = 'Getting Started';
            }
        }

        this.save();
    }
}

module.exports = Hippocampus;
