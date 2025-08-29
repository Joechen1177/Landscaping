import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, onSnapshot, setDoc, updateDoc, collection, addDoc, query, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- Global Variables ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const correctPassword = '1314';

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- State Variables ---
let isAuthenticated = false;
let userId = '';
let projectData = null;
let notes = [];
let payments = [];
let provisionalSums = [];
let primeCosts = [];
let excludedItems = [];

// --- Helper function to format currency ---
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AU', {
        style: 'currency',
        currency: 'AUD',
        minimumFractionDigits: 2
    }).format(amount);
};

// --- Authentication and Data Fetching ---
const handleLogin = async (password) => {
    if (password === correctPassword) {
        try {
            await signInAnonymously(auth);
        } catch (error) {
            renderMessage(`Error logging in: ${error.message}`, 'text-red-500');
        }
    } else {
        renderMessage('Incorrect password. Please try again.', 'text-red-500');
    }
};

const handleLogout = async () => {
    try {
        await signOut(auth);
        isAuthenticated = false;
        userId = '';
        renderApp();
        renderMessage('Logged out successfully!', 'text-green-500');
    } catch (error) {
        renderMessage(`Error logging out: ${error.message}`, 'text-red-500');
    }
};

// Listen for authentication state changes
onAuthStateChanged(auth, (user) => {
    if (user) {
        isAuthenticated = true;
        userId = user.uid;
        setupFirestoreListeners();
    } else {
        isAuthenticated = false;
    }
    renderApp();
});

// Setup real-time listeners for Firestore data
const setupFirestoreListeners = () => {
    const projectDocRef = doc(db, 'artifacts', appId, 'users', userId, 'projectData', 'main');
    const paymentsRef = collection(db, 'artifacts', appId, 'users', userId, 'payments');

    // Listener for main project data
    onSnapshot(projectDocRef, (docSnap) => {
        if (docSnap.exists()) {
            projectData = docSnap.data();
            notes = projectData.notes || [];
            provisionalSums = projectData.provisionalSums || [];
            primeCosts = projectData.primeCosts || [];
            excludedItems = projectData.excludedItems || [];
            renderApp();
        } else {
            setupInitialData();
        }
    }, (error) => {
        console.error("Error fetching Firestore data:", error);
        renderMessage("Failed to load project data. Please try again.", 'text-red-500');
    });

    // Listener for payments collection
    onSnapshot(paymentsRef, (snapshot) => {
        payments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        payments.sort((a, b) => new Date(a.date) - new Date(b.date));
        renderApp();
    }, (error) => {
        console.error("Error fetching payments:", error);
    });
};

const setupInitialData = async () => {
    const initialData = {
        totalCost: 226546.48,
        currentSpend: 0,
        stages: {
            "Hardworks": false,
            "Softworks": false,
            "Variations": false,
            "Final Completion": false,
        },
        notes: [],
        unexpectedCosts: [],
        provisionalSums: [
            { description: "Electrical Works", estimated: 7500, actual: null, checked: false },
            { description: "Plumbing Works", estimated: 4500, actual: null, checked: false },
            { description: "Excavation and Site Preparation", estimated: 12000, actual: null, checked: false },
            { description: "Fencing", estimated: 8000, actual: null, checked: false },
            { description: "Tiling and Paving", estimated: 15000, actual: null, checked: false },
            { description: "Lighting Fixtures", estimated: 2500, actual: null, checked: false },
            { description: "Water Features", estimated: 5000, actual: null, checked: false },
            { description: "Timber Decking", estimated: 9000, actual: null, checked: false },
        ],
        primeCosts: [
            { description: "Retaining Wall", allowance: 10000, actual: null, checked: false },
            { description: "Pool", allowance: 50000, actual: null, checked: false },
            { description: "Pergola", allowance: 6000, actual: null, checked: false },
            { description: "Outdoor Kitchen", allowance: 12000, actual: null, checked: false },
            { description: "Irrigation System", allowance: 3000, actual: null, checked: false },
            { description: "Garden Shed/Storage", allowance: 2500, actual: null, checked: false},
            { description: "Patio Furniture/Outdoor Seating", allowance: 4000, actual: null, checked: false},
        ],
        excludedItems: [],
    };
    try {
        const projectDocRef = doc(db, 'artifacts', appId, 'users', userId, 'projectData', 'main');
        await setDoc(projectDocRef, initialData, { merge: true });
        console.log("Initial data set for new user.");
    } catch (error) {
        console.error("Error setting initial data:", error);
    }
};

// --- DOM Rendering Functions ---
const renderApp = () => {
    const appContainer = document.getElementById('app');
    if (!appContainer) return;

    if (!isAuthenticated) {
        appContainer.innerHTML = `
            <div class="min-h-screen flex items-center justify-center p-4">
                <div class="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
                    <h2 class="text-2xl font-bold mb-4 text-center text-gray-800">Enter Project Password</h2>
                    <p id="message" class="text-center text-sm text-red-500 h-6"></p>
                    <form id="login-form">
                        <input
                            type="password"
                            id="password-input"
                            placeholder="Password"
                            class="w-full p-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <button
                            type="submit"
                            class="w-full bg-blue-500 text-white p-2 rounded-md font-semibold hover:bg-blue-600 transition-colors"
                        >
                            Log In
                        </button>
                    </form>
                </div>
            </div>
        `;
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const password = document.getElementById('password-input').value;
            handleLogin(password);
        });
    } else {
        // Main dashboard
        appContainer.innerHTML = `
            <header class="bg-white p-6 rounded-lg shadow-md mb-4 flex flex-col md:flex-row justify-between items-center">
                <h1 class="text-2xl font-bold text-blue-600">Landscaping Tracker</h1>
                <div class="flex items-center space-x-4 mt-4 md:mt-0">
                    <p class="text-sm text-gray-600 hidden md:block">User ID: <span class="font-mono text-xs">${userId}</span></p>
                    <button id="logout-btn" class="bg-red-500 text-white text-sm px-4 py-2 rounded-md hover:bg-red-600 transition-colors">Log Out</button>
                </div>
            </header>
            <main class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                ${renderSummaryCard()}
                ${renderStagesCard()}
                ${renderTimelineCard()}
                ${renderProvisionalSumsCard()}
                ${renderPrimeCostsCard()}
                ${renderPaymentTrackerCard()}
                ${renderUnexpectedCostsCard()}
                ${renderNotesSection()}
                ${renderExcludedItemsSection()}
            </main>
        `;
        // Attach event listeners after rendering
        document.getElementById('logout-btn').addEventListener('click', handleLogout);
        setupEventListeners();
    }
};

const renderMessage = (text, className) => {
    const messageEl = document.getElementById('message');
    if (messageEl) {
        messageEl.textContent = text;
        messageEl.className = `text-center text-sm ${className} h-6`;
    }
};

// ... (other rendering functions like renderSummaryCard, renderStagesCard, etc.) ...

const setupEventListeners = () => {
    // Event listener for project stages
    document.querySelectorAll('.stage-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            handleStageChange(e.target.dataset.stage);
        });
    });

    // Event listener for adding notes
    document.getElementById('note-form')?.addEventListener('submit', handleAddNote);
    
    // Event listener for adding excluded items
    document.getElementById('excluded-item-form')?.addEventListener('submit', handleAddExcludedItem);

    // Event listener for provisional sums checkboxes
    document.querySelectorAll('.provisional-sum-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            handleProvisionalSumChange(parseInt(e.target.dataset.index, 10));
        });
    });
    
    // Event listener for prime costs checkboxes
    document.querySelectorAll('.prime-cost-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            handlePrimeCostChange(parseInt(e.target.dataset.index, 10));
        });
    });

    // Event listener for adding payments
    document.getElementById('payment-form')?.addEventListener('submit', handleAddPayment);

    // Event listener for adding unexpected costs
    document.getElementById('unexpected-cost-form')?.addEventListener('submit', handleAddUnexpectedCost);
};

// --- Data Management Functions ---
const handleStageChange = async (stage) => {
    if (!projectData || !userId) return;
    const newStages = { ...projectData.stages, [stage]: !projectData.stages[stage] };
    const projectDocRef = doc(db, 'artifacts', appId, 'users', userId, 'projectData', 'main');
    try {
        await updateDoc(projectDocRef, { stages: newStages });
    } catch (error) {
        console.error("Error updating stage:", error);
    }
};

const handleAddNote = async (e) => {
    e.preventDefault();
    const noteInput = document.getElementById('note-input');
    if (!noteInput.value || !userId || !projectData) return;
    const newNotes = [...projectData.notes, {
        text: noteInput.value,
        timestamp: new Date().toISOString(),
    }];
    const projectDocRef = doc(db, 'artifacts', appId, 'users', userId, 'projectData', 'main');
    try {
        await updateDoc(projectDocRef, { notes: newNotes });
        noteInput.value = '';
    } catch (error) {
        console.error("Error adding note:", error);
    }
};

const handleAddExcludedItem = async (e) => {
    e.preventDefault();
    const excludedItemInput = document.getElementById('excluded-item-input');
    if (!excludedItemInput.value || !userId || !projectData) return;
    const updatedItems = [...excludedItems, {
        description: excludedItemInput.value,
        checked: false,
    }];
    const projectDocRef = doc(db, 'artifacts', appId, 'users', userId, 'projectData', 'main');
    try {
        await updateDoc(projectDocRef, { excludedItems: updatedItems });
        excludedItemInput.value = '';
    } catch (error) {
        console.error("Error adding excluded item:", error);
    }
};

const handleProvisionalSumChange = async (index) => {
    if (!projectData || !userId) return;
    const updatedSums = [...provisionalSums];
    updatedSums[index].checked = !updatedSums[index].checked;
    const projectDocRef = doc(db, 'artifacts', appId, 'users', userId, 'projectData', 'main');
    try {
        await updateDoc(projectDocRef, { provisionalSums: updatedSums });
    } catch (error) {
        console.error("Error updating provisional sum:", error);
    }
};

const handlePrimeCostChange = async (index) => {
    if (!projectData || !userId) return;
    const updatedCosts = [...primeCosts];
    updatedCosts[index].checked = !updatedCosts[index].checked;
    const projectDocRef = doc(db, 'artifacts', appId, 'users', userId, 'projectData', 'main');
    try {
        await updateDoc(projectDocRef, { primeCosts: updatedCosts });
    } catch (error) {
        console.error("Error updating prime cost:", error);
    }
};

const handleAddPayment = async (e) => {
    e.preventDefault();
    const amountInput = document.getElementById('payment-amount-input');
    const dateInput = document.getElementById('payment-date-input');
    if (!amountInput.value || !dateInput.value || !userId || !projectData) return;
    const amount = parseFloat(amountInput.value);
    if (isNaN(amount)) {
        renderMessage("Please enter a valid amount.", 'text-red-500');
        return;
    }
    const projectDocRef = doc(db, 'artifacts', appId, 'users', userId, 'projectData', 'main');
    const paymentsRef = collection(db, 'artifacts', appId, 'users', userId, 'payments');
    const newCurrentSpend = parseFloat((projectData.currentSpend + amount).toFixed(2));
    const newPayment = { amount: amount, date: dateInput.value, timestamp: new Date().toISOString() };
    try {
        await updateDoc(projectDocRef, { currentSpend: newCurrentSpend });
        await addDoc(paymentsRef, newPayment);
        amountInput.value = '';
        dateInput.value = '';
    } catch (error) {
        console.error("Error adding payment:", error);
    }
};

const handleAddUnexpectedCost = async (e) => {
    e.preventDefault();
    const costInput = document.getElementById('unexpected-cost-input');
    if (!costInput.value || !userId || !projectData) return;
    const amount = parseFloat(costInput.value);
    if (isNaN(amount)) {
        renderMessage("Please enter a valid amount for unexpected cost.", 'text-red-500');
        return;
    }
    const newUnexpectedCosts = [...projectData.unexpectedCosts, { amount: amount, timestamp: new Date().toISOString() }];
    const newCurrentSpend = parseFloat((projectData.currentSpend + amount).toFixed(2));
    const projectDocRef = doc(db, 'artifacts', appId, 'users', userId, 'projectData', 'main');
    try {
        await updateDoc(projectDocRef, { unexpectedCosts: newUnexpectedCosts, currentSpend: newCurrentSpend });
        costInput.value = '';
    } catch (error) {
        console.error("Error adding unexpected cost:", error);
    }
};

// Initial render
window.onload = renderApp;
