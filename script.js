class SteadyStateCalculator {
    constructor() {
        this.initializeEventListeners();
        this.hideResults();
    }

    initializeEventListeners() {
        const calculateBtn = document.getElementById('calculateBtn');
        const halfLifeInput = document.getElementById('halfLife');
        
        calculateBtn.addEventListener('click', () => this.calculateSteadyState());
        
        // Allow Enter key to trigger calculation
        halfLifeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.calculateSteadyState();
            }
        });
    }

    hideResults() {
        const resultsSection = document.getElementById('resultsSection');
        resultsSection.style.display = 'none';
    }

    showResults() {
        const resultsSection = document.getElementById('resultsSection');
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    validateInput() {
        const halfLife = parseFloat(document.getElementById('halfLife').value);
        
        if (!halfLife || halfLife <= 0) {
            this.showError('Please enter a valid half-life value greater than 0');
            return false;
        }
        
        if (halfLife > 1000) {
            this.showError('Half-life value seems unusually high. Please verify.');
            return false;
        }
        
        return true;
    }

    showError(message) {
        // Create or update error message
        let errorDiv = document.getElementById('errorMessage');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'errorMessage';
            errorDiv.style.cssText = `
                background: #fed7d7;
                color: #c53030;
                padding: 12px;
                border-radius: 8px;
                margin: 10px 0;
                border-left: 4px solid #e53e3e;
                font-weight: 500;
            `;
            document.querySelector('.calculator-section').appendChild(errorDiv);
        }
        
        errorDiv.textContent = message;
        errorDiv.scrollIntoView({ behavior: 'smooth' });
        
        // Remove error after 5 seconds
        setTimeout(() => {
            if (errorDiv) {
                errorDiv.remove();
            }
        }, 5000);
    }

    removeError() {
        const errorDiv = document.getElementById('errorMessage');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    convertToHours(value, unit) {
        switch (unit) {
            case 'minutes':
                return value / 60;
            case 'hours':
                return value;
            case 'days':
                return value * 24;
            default:
                return value;
        }
    }

    formatTime(hours) {
        if (hours < 1) {
            const minutes = Math.round(hours * 60);
            return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
        } else if (hours < 24) {
            const roundedHours = Math.round(hours * 10) / 10;
            return `${roundedHours} hour${roundedHours !== 1 ? 's' : ''}`;
        } else {
            const days = Math.round(hours / 24 * 10) / 10;
            const remainingHours = Math.round(hours % 24);
            if (remainingHours === 0) {
                return `${days} day${days !== 1 ? 's' : ''}`;
            } else {
                return `${Math.floor(days)} day${Math.floor(days) !== 1 ? 's' : ''} ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`;
            }
        }
    }

    getHalfLivesForSteadyState(percentage) {
        const multipliers = {
            90: 3.3,
            95: 4.3,
            97: 5.0,
            99: 6.6
        };
        return multipliers[percentage] || 5.0;
    }

    getClinicalInfo(drugName, steadyStateHours, percentage) {
        let info = `At ${percentage}% steady state, the drug concentration will be relatively stable. `;
        
        if (steadyStateHours < 24) {
            info += "Steady state will be reached within the first day of therapy. ";
        } else if (steadyStateHours < 72) {
            info += "Steady state will be reached within 2-3 days of therapy. ";
        } else if (steadyStateHours < 168) {
            info += "Steady state will be reached within the first week of therapy. ";
        } else {
            info += "Steady state will take more than a week to achieve. Consider loading dose if appropriate. ";
        }
        
        info += "This is the optimal time for therapeutic drug monitoring and dosage adjustments.";
        
        if (drugName) {
            info = `For ${drugName}: ` + info;
        }
        
        return info;
    }

    calculateSteadyState() {
        this.removeError();
        
        if (!this.validateInput()) {
            return;
        }

        // Get input values
        const drugName = document.getElementById('drugName').value.trim();
        const halfLifeValue = parseFloat(document.getElementById('halfLife').value);
        const timeUnit = document.getElementById('timeUnit').value;
        const steadyStateLevel = parseInt(document.getElementById('steadyStateLevel').value);

        // Convert half-life to hours
        const halfLifeHours = this.convertToHours(halfLifeValue, timeUnit);
        
        // Calculate steady state
        const halfLivesMultiplier = this.getHalfLivesForSteadyState(steadyStateLevel);
        const steadyStateHours = halfLifeHours * halfLivesMultiplier;

        // Update results
        document.getElementById('steadyStateTime').textContent = this.formatTime(steadyStateHours);
        document.getElementById('halfLivesCount').textContent = `${halfLivesMultiplier} half-lives`;
        document.getElementById('steadyStatePercent').textContent = `${steadyStateLevel}%`;
        
        // Update clinical information
        const clinicalInfo = this.getClinicalInfo(drugName, steadyStateHours, steadyStateLevel);
        document.getElementById('clinicalInfo').textContent = clinicalInfo;

        // Show results
        this.showResults();
        
        // Add animation effect
        const resultCard = document.querySelector('.result-card');
        resultCard.style.transform = 'scale(0.95)';
        resultCard.style.opacity = '0.7';
        
        setTimeout(() => {
            resultCard.style.transform = 'scale(1)';
            resultCard.style.opacity = '1';
            resultCard.style.transition = 'all 0.3s ease';
        }, 100);
    }
}

// Initialize the calculator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SteadyStateCalculator();
    
    // Add some additional interactivity
    const inputs = document.querySelectorAll('.input-field');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'translateY(-2px)';
            this.parentElement.style.transition = 'transform 0.2s ease';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'translateY(0)';
        });
    });
});

// Service Worker Registration for PWA functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // This would register a service worker if you want PWA functionality
        console.log('SteadyCheck loaded successfully');
    });
}