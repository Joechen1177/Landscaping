document.addEventListener('DOMContentLoaded', () => {
    // Contract details from Pure Landscape and Carpentry contract
    const contractDetails = {
        totalCost: 226546.48,
        client: "Joe Chen",
        contractor: "Pure Landscape and Carpentry Pty Ltd",
        address: "20 Buckra Avenue, Turramurra NSW 2074",
        contractDate: "22.08.25",
        startDate: new Date('2025-08-27'),
        estimatedDuration: 8 // weeks as per contract
    };

    // Payment stages from the contract
    const paymentStages = [
        {
            id: 1,
            name: "Preparation/Footings/Common Brick Walls/Front Fence",
            amount: 46145.00,
            completed: false,
            description: "Site preparation, footings, and initial infrastructure"
        },
        {
            id: 2,
            name: "Pine Walls/Boundary Fence/Waterproofing/Ag-lines/Concrete",
            amount: 42102.50,
            completed: false,
            description: "Structural works and waterproofing systems"
        },
        {
            id: 3,
            name: "Render/Pier Caps/Steel Edging/Stepping Stones/Climber Support/Driveway/Soil Works",
            amount: 33676.50,
            completed: false,
            description: "Finishing works and landscaping preparation"
        },
        {
            id: 4,
            name: "Colored Concrete/Rough Pour Driveway/Paint Timber/Council Crossover",
            amount: 30226.73,
            completed: false,
            description: "Concrete works and external finishes"
        },
        {
            id: 5,
            name: "Plants",
            amount: 32374.65,
            completed: false,
            description: "Plant installation and landscaping"
        },
        {
            id: 6,
            name: "Irrigation/Mulch/Turf/Clean Up/Side Security Gates",
            amount: 42021.10,
            completed: false,
            description: "Final irrigation, turf installation and project completion"
        }
    ];

    let currentSpend = 0;
    let additionalCosts = 0;
    
    const timeline = document.getElementById('timeline');
    const notesList = document.getElementById('notes-list');
    const noteInput = document.getElementById('note-input');
    const addNoteBtn = document.getElementById('add-note-btn');
    const loginForm = document.getElementById('login-form');
    const loginSection = document.getElementById('login-section');
    const dashboardSection = document.getElementById('dashboard');
    const stagesSection = document.getElementById('stages-section');
    const timelineSection = document.getElementById('timeline-section');
    const notesSection = document.getElementById('notes-section');
    
    // Function to update dashboard
    function updateDashboard() {
        const totalProjectCost = contractDetails.totalCost + additionalCosts;
        const remainingCost = totalProjectCost - currentSpend;
        
        // Update totals
        document.getElementById('total-cost').textContent = `A$${totalProjectCost.toLocaleString('en-AU', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        document.getElementById('current-spend').textContent = `A$${currentSpend.toLocaleString('en-AU', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        document.getElementById('remaining-cost').textContent = `A$${remainingCost.toLocaleString('en-AU', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        
        // Update progress bar
        const progress = (currentSpend / totalProjectCost) * 100;
        document.getElementById('project-progress').style.width = `${Math.min(progress, 100)}%`;
        document.getElementById('progress-text').textContent = `${Math.min(progress, 100).toFixed(1)}% Complete`;
        
        // Update completed stages count
        const completedStages = paymentStages.filter(stage => stage.completed).length;
        const completedStagesElement = document.getElementById('completed-stages');
        if (completedStagesElement) {
            completedStagesElement.textContent = `${completedStages}/${paymentStages.length} Payment Stages Complete`;
        }
    }

    // Function to create detailed stages list
    function createStagesList() {
        const stagesList = document.getElementById('stages-list');
        if (!stagesList) return;
        
        stagesList.innerHTML = '';
        
        paymentStages.forEach((stage) => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <div class="stage-item">
                    <label class="stage-header">
                        <input type="checkbox" data-stage-id="${stage.id}" ${stage.completed ? 'checked' : ''}>
                        <strong>Stage ${stage.id}: ${stage.name}</strong>
                        <span class="stage-amount">A$${stage.amount.toLocaleString('en-AU', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </label>
                    <p class="stage-description">${stage.description}</p>
                </div>
            `;
            stagesList.appendChild(listItem);
        });
        
        // Add event listeners to the newly created checkboxes
        const stageCheckboxes = stagesList.querySelectorAll('input[type="checkbox"]');
        stageCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', handleStageCompletion);
        });
    }

    // Function to add a note
    function addNote(noteText, isCostUpdate = false, costChange = 0, isStageCompletion = false, stageName = '') {
        if (!notesList) return;
        
        const noteDiv = document.createElement('div');
        noteDiv.classList.add('note');
        
        let displayNote = noteText;
        let noteClass = '';
        
        if (isCostUpdate) {
            displayNote = `Cost Update: ${noteText}`;
            additionalCosts += costChange;
            noteClass = 'cost-update';
            updateDashboard();
        } else if (isStageCompletion) {
            displayNote = `Stage Completed: ${stageName}`;
            noteClass = 'stage-completion';
        }

        noteDiv.innerHTML = `
            <div class="note-content ${noteClass}">
                <p>${displayNote}</p>
                <small>${new Date().toLocaleString('en-AU')}</small>
            </div>
        `;
        notesList.insertBefore(noteDiv, notesList.firstChild);
        if (noteInput) noteInput.value = '';
    }

    // Function to handle stage completion
    function handleStageCompletion(event) {
        const stageId = parseInt(event.target.dataset.stageId);
        const stage = paymentStages.find(s => s.id === stageId);
        
        if (!stage || !timeline) return;
        
        const now = new Date();
        const timelineEvent = document.createElement('div');
        timelineEvent.classList.add('timeline-event');
        
        if (event.target.checked) {
            // Stage completed
            stage.completed = true;
            currentSpend += stage.amount;
            
            timelineEvent.innerHTML = `
                <div class="timeline-content completed">
                    <p><strong>Payment Stage ${stage.id} Completed</strong></p>
                    <p>${stage.name}</p>
                    <p class="amount">Amount: A$${stage.amount.toLocaleString('en-AU', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                    <small>${now.toLocaleDateString('en-AU')} at ${now.toLocaleTimeString('en-AU')}</small>
                </div>
            `;
            
            addNote(`Stage ${stage.id} completed: ${stage.name} - A$${stage.amount.toLocaleString('en-AU', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, false, 0, true, stage.name);
        } else {
            // Stage uncompleted
            stage.completed = false;
            currentSpend -= stage.amount;
            
            timelineEvent.innerHTML = `
                <div class="timeline-content uncompleted">
                    <p><strong>Payment Stage ${stage.id} Marked Incomplete</strong></p>
                    <p>${stage.name}</p>
                    <p class="amount">Amount: A$${stage.amount.toLocaleString('en-AU', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                    <small>${now.toLocaleDateString('en-AU')} at ${now.toLocaleTimeString('en-AU')}</small>
                </div>
            `;
        }
        
        timeline.insertBefore(timelineEvent, timeline.firstChild);
        updateDashboard();
    }
    
    // Function to generate initial timeline
    function generateTimeline() {
        if (!timeline) return;
        
        const timelineStart = document.createElement('div');
        timelineStart.classList.add('timeline-event');
        timelineStart.innerHTML = `
            <div class="timeline-content project-start">
                <p><strong>Project Contract Signed</strong></p>
                <p>Pure Landscape and Carpentry Pty Ltd</p>
                <p>Client: ${contractDetails.client}</p>
                <p>Total Contract Value: A$${contractDetails.totalCost.toLocaleString('en-AU', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                <small>${contractDetails.startDate.toLocaleDateString('en-AU')}</small>
            </div>
        `;
        timeline.appendChild(timelineStart);
        
        // Add estimated completion date
        const estimatedEnd = new Date(contractDetails.startDate);
        estimatedEnd.setDate(estimatedEnd.getDate() + (contractDetails.estimatedDuration * 7)); // Convert weeks to days
        
        const timelineEnd = document.createElement('div');
        timelineEnd.classList.add('timeline-event');
        timelineEnd.innerHTML = `
            <div class="timeline-content estimated">
                <p><strong>Estimated Project Completion</strong></p>
                <p>Based on ${contractDetails.estimatedDuration} week contract duration</p>
                <small>Target: ${estimatedEnd.toLocaleDateString('en-AU')}</small>
            </div>
        `;
        timeline.appendChild(timelineEnd);
    }

    // Function to parse cost updates from notes
    function parseCostUpdate(noteText) {
        const costRegex = /(?:cost update|additional cost|extra cost|variation):?\s*[A$]*\s*([\d,]+\.?\d*)/i;
        const match = noteText.match(costRegex);
        if (match) {
            return parseFloat(match[1].replace(/,/g, ''));
        }
        return null;
    }

    // Event Listeners
    if (addNoteBtn && noteInput) {
        addNoteBtn.addEventListener('click', () => {
            const noteText = noteInput.value.trim();
            if (noteText) {
                const costChange = parseCostUpdate(noteText);
                if (costChange) {
                    addNote(noteText, true, costChange);
                } else {
                    addNote(noteText);
                }
            }
        });

        // Allow Enter key to add notes
        noteInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                addNoteBtn.click();
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            
            // Show all sections
            if (loginSection) loginSection.style.display = 'none';
            if (dashboardSection) dashboardSection.style.display = 'block';
            if (stagesSection) stagesSection.style.display = 'block';
            if (timelineSection) timelineSection.style.display = 'block';
            if (notesSection) notesSection.style.display = 'block';
            
            // Initialize the tracker
            createStagesList();
            updateDashboard();
            generateTimeline();
            
            // Add welcome note
            addNote(`Project tracker initialized for ${contractDetails.client} - ${contractDetails.address}`);
        });
    }

    // Initialize dashboard on page load (hidden)
    updateDashboard();
});
