document.addEventListener('DOMContentLoaded', () => {
    const totalCost = 226546.48;
    let currentSpend = 0;
    const stages = document.querySelectorAll('#stages-list input[type="checkbox"]');
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
        const remainingCost = totalCost - currentSpend;
        document.getElementById('current-spend').textContent = `A$${currentSpend.toFixed(2)}`;
        document.getElementById('remaining-cost').textContent = `A$${remainingCost.toFixed(2)}`;
        
        const progress = (currentSpend / totalCost) * 100;
        document.getElementById('project-progress').style.width = `${progress}%`;
        document.getElementById('progress-text').textContent = `${progress.toFixed(0)}% Complete`;
    }

    // Function to add a note
    function addNote(noteText, isCostUpdate = false, costChange = 0) {
        const noteDiv = document.createElement('div');
        noteDiv.classList.add('note');
        
        let displayNote = noteText;
        if (isCostUpdate) {
            displayNote = `**Cost Update:** ${noteText}`;
            currentSpend += costChange;
            updateDashboard();
        }

        noteDiv.innerHTML = `<p>${displayNote}</p><small>${new Date().toLocaleString()}</small>`;
        notesList.appendChild(noteDiv);
        noteInput.value = '';
    }

    // Function to handle stage completion
    function handleStageCompletion(event) {
        const stageName = event.target.dataset.stage;
        const now = new Date();
        const timelineEvent = document.createElement('div');
        timelineEvent.classList.add('timeline-event');
        timelineEvent.innerHTML = `<p><strong>${stageName}</strong> completed.</p><small>${now.toDateString()}</small>`;
        timeline.appendChild(timelineEvent);
    }
    
    // Function to generate timeline based on project start date
    function generateTimeline() {
        const startDate = new Date('2025-08-27');
        const endDate = new Date(startDate);
        endDate.setMonth(startDate.getMonth() + 12); // Assuming a 12-month project duration

        const timelineStart = document.createElement('div');
        timelineStart.classList.add('timeline-event');
        timelineStart.innerHTML = `<p><strong>Project Start</strong></p><small>${startDate.toDateString()}</small>`;
        timeline.appendChild(timelineStart);
    }

    // Event Listeners
    addNoteBtn.addEventListener('click', () => {
        const noteText = noteInput.value.trim();
        if (noteText) {
            const costRegex = /cost update: A\$([\d,\.]+)/i;
            const match = noteText.match(costRegex);
            if (match) {
                const costChange = parseFloat(match[1].replace(/,/g, ''));
                addNote(noteText, true, costChange);
            } else {
                addNote(noteText);
            }
        }
    });

    stages.forEach(stage => {
        stage.addEventListener('change', handleStageCompletion);
    });

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        // This is a conceptual login. In a real app, you would validate credentials here.
        loginSection.style.display = 'none';
        dashboardSection.style.display = 'block';
        stagesSection.style.display = 'block';
        timelineSection.style.display = 'block';
        notesSection.style.display = 'block';
        updateDashboard();
        generateTimeline();
    });
});
