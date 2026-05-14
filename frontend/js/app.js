/**
 * Mini Trello - Frontend Application
 * Vanilla JavaScript task management interface
 * Consumes Spring Boot REST API backend
 */

// ===== CONFIGURATION =====
const API_BASE = 'http://localhost:8080/api';
const AUTH_STORAGE_KEY = 'miniTrello.auth';

// ===== APPLICATION STATE =====
let boards = [];
let lists = [];
let cards = [];
let auth = loadAuth();

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async () => {
    syncAuthUi();
    await loadBoards();
    setupEventListeners();
    lucide.createIcons();
});

/**
 * Set up global event listeners for the application
 */
function setupEventListeners() {
    document.getElementById('add-board-btn').addEventListener('click', showAddBoardModal);
    document.getElementById('login-btn').addEventListener('click', showLoginModal);
    document.getElementById('register-btn').addEventListener('click', showRegisterModal);
    document.getElementById('logout-btn').addEventListener('click', logout);
    document.querySelector('.close').addEventListener('click', hideModal);
    document.getElementById('modal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('modal')) hideModal();
    });
}

// ===== AUTH =====

/**
 * Load persisted auth state (JWT token + username) from localStorage.
 */
function loadAuth() {
    try {
        const raw = localStorage.getItem(AUTH_STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

/**
 * Persist auth state.
 */
function saveAuth(nextAuth) {
    auth = nextAuth;
    if (!nextAuth) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
    } else {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextAuth));
    }
    syncAuthUi();
}

/**
 * Update header UI based on whether the user is signed in.
 */
function syncAuthUi() {
    const userChip = document.getElementById('user-chip');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const logoutBtn = document.getElementById('logout-btn');

    if (auth?.accessToken) {
        userChip.textContent = auth.username || 'Signed in';
        userChip.classList.remove('hidden');
        loginBtn.classList.add('hidden');
        registerBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
    } else {
        userChip.textContent = '';
        userChip.classList.add('hidden');
        loginBtn.classList.remove('hidden');
        registerBtn.classList.remove('hidden');
        logoutBtn.classList.add('hidden');
    }
}

/**
 * Wrapper around fetch() that automatically adds JSON headers and JWT bearer auth (when available).
 */
async function apiFetch(path, options = {}) {
    const headers = new Headers(options.headers || {});
    if (!headers.has('Content-Type') && options.body) {
        headers.set('Content-Type', 'application/json');
    }
    if (auth?.accessToken) {
        headers.set('Authorization', `Bearer ${auth.accessToken}`);
    }

    const response = await fetch(`${API_BASE}${path}`, { ...options, headers });

    // Token might be expired/invalid: log out and force re-login.
    if (response.status === 401 && auth?.accessToken) {
        saveAuth(null);
        alert('Your session expired. Please log in again.');
    }

    return response;
}

/**
 * Escape a string for safe HTML insertion (prevents broken markup and basic XSS vectors).
 */
function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

// ===== DATA LOADING =====

/**
 * Load all data from the backend API in parallel
 * Fetches boards, lists, and cards simultaneously
 */
async function loadBoards() {
    try {
        showLoadingState();
        const [boardsRes, listsRes, cardsRes] = await Promise.all([
            apiFetch('/boards'),
            apiFetch('/lists'),
            apiFetch('/cards')
        ]);
        
        // Validate responses
        if (!boardsRes.ok || !listsRes.ok || !cardsRes.ok) {
            throw new Error(`API error: ${boardsRes.status} ${listsRes.status} ${cardsRes.status}`);
        }
        
        boards = await boardsRes.json();
        lists = await listsRes.json();
        cards = await cardsRes.json();
        renderBoards();
    } catch (error) {
        console.error('Error loading data:', error);
        showConnectionError();
    }
}

/**
 * Show loading state while fetching data
 */
function showLoadingState() {
    document.getElementById('boards-container').innerHTML = '<div class="loading">Loading boards...</div>';
}

/**
 * Show error message when backend is not accessible
 */
function showConnectionError() {
    document.getElementById('boards-container').innerHTML = `
        <div class="error-state">
            <h3>Connection Error</h3>
            <p>Cannot connect to the backend server.</p>
            <p class="error-detail">Make sure the Spring Boot backend is running on <strong>http://localhost:8080</strong></p>
            <p class="error-hint">To start the backend, run: <code>mvn spring-boot:run</code> in the backend folder</p>
        </div>
    `;
}

// ===== RENDERING =====

/**
 * Render all boards with their lists and cards
 * Creates the main board view with all nested data
 */
function renderBoards() {
    const container = document.getElementById('boards-container');
    
    if (boards.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No boards yet</h3>
                <p>Create your first board to get started!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = boards.map(board => {
        const boardLists = lists.filter(l => l.boardId === board.id);
        return `
            <div class="board-card" data-id="${board.id}">
                <div class="board-header">
                    <h2>${board.name}</h2>
                    <div class="board-actions">
                        <button class="btn-icon" onclick="showEditBoardModal(${board.id})" title="Edit board">
                            <i data-lucide="pencil"></i>
                        </button>
                        <button class="btn-icon" onclick="showAddListModal(${board.id})" title="Add list">
                            <i data-lucide="plus"></i>
                        </button>
                        <button class="btn-icon delete" onclick="deleteBoard(${board.id})" title="Delete board">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </div>
                <div class="board-lists">
                    ${boardLists.map(list => `
                        <div class="list-card" data-id="${list.id}">
                            <div class="list-header">
                                <h3>${list.name}</h3>
                                <div class="board-actions">
                                    <button class="btn-icon" onclick="showEditListModal(${list.id})" title="Edit list">
                                        <i data-lucide="pencil"></i>
                                    </button>
                                    <button class="btn-icon delete" onclick="deleteList(${list.id})" title="Delete list">
                                        <i data-lucide="trash-2"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="cards-container">
                                ${cards.filter(c => c.listId === list.id).map(card => `
                                    <div class="card-item" data-id="${card.id}">
                                        <h4>${card.title}</h4>
                                        ${card.description ? `<p>${card.description}</p>` : ''}
                                        <button class="btn-icon" onclick="showEditCardModal(${card.id})" title="Edit card">
                                            <i data-lucide="pencil"></i>
                                        </button>
                                        <button class="btn-icon delete" onclick="deleteCard(${card.id})" title="Delete card">
                                            <i data-lucide="trash-2"></i>
                                        </button>
                                    </div>
                                `).join('')}
                            </div>
                            <button class="add-item-btn" onclick="showAddCardModal(${list.id})">
                                <i data-lucide="plus-circle"></i> Add card
                            </button>
                        </div>
                    `).join('') || '<div class="empty-state"><p>No lists yet</p></div>'}
                </div>
            </div>
        `;
    }).join('');
    
    // Initialize icons for newly rendered content
    lucide.createIcons();
}

// ===== MODAL FUNCTIONS =====

/**
 * Display the modal with custom content
 */
function showModal(content) {
    document.getElementById('modal-body').innerHTML = content;
    document.getElementById('modal').classList.remove('hidden');
    lucide.createIcons();
}

/**
 * Hide the modal dialog
 */
function hideModal() {
    document.getElementById('modal').classList.add('hidden');
}

/**
 * Clear auth token and update UI.
 */
function logout() {
    saveAuth(null);
}

/**
 * Show modal form for logging in.
 */
function showLoginModal() {
    showModal(`
        <h3>Login</h3>
        <form id="login-form">
            <div class="form-group">
                <label for="login-username">Username</label>
                <input type="text" id="login-username" required autofocus autocomplete="username">
            </div>
            <div class="form-group">
                <label for="login-password">Password</label>
                <input type="password" id="login-password" required autocomplete="current-password">
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="hideModal()">Cancel</button>
                <button type="submit" class="btn-primary">Login</button>
            </div>
        </form>
    `);

    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;
        if (!username || !password) return;

        try {
            const res = await apiFetch('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });
            if (!res.ok) {
                alert('Login failed. Check your username/password.');
                return;
            }
            const data = await res.json();
            saveAuth({ accessToken: data.accessToken, username: data.username });
            hideModal();
        } catch (err) {
            console.error('Login error:', err);
            alert('Login failed. Is the backend running?');
        }
    });
}

/**
 * Show modal form for creating a new account.
 */
function showRegisterModal() {
    showModal(`
        <h3>Create Account</h3>
        <form id="register-form">
            <div class="form-group">
                <label for="register-username">Username</label>
                <input type="text" id="register-username" required autofocus autocomplete="username">
            </div>
            <div class="form-group">
                <label for="register-password">Password</label>
                <input type="password" id="register-password" required minlength="6" autocomplete="new-password">
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="hideModal()">Cancel</button>
                <button type="submit" class="btn-primary">Register</button>
            </div>
        </form>
    `);

    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('register-username').value.trim();
        const password = document.getElementById('register-password').value;
        if (!username || !password) return;

        try {
            const res = await apiFetch('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });
            if (res.status === 409) {
                alert('That username is already taken.');
                return;
            }
            if (!res.ok) {
                alert('Registration failed. Please try again.');
                return;
            }
            const data = await res.json();
            saveAuth({ accessToken: data.accessToken, username: data.username });
            hideModal();
        } catch (err) {
            console.error('Register error:', err);
            alert('Registration failed. Is the backend running?');
        }
    });
}

// ===== CREATE MODALS =====

/**
 * Show modal form for creating a new board
 */
function showAddBoardModal() {
    showModal(`
        <h3>Add New Board</h3>
        <form id="add-board-form">
            <div class="form-group">
                <label for="board-name">Board Name</label>
                <input type="text" id="board-name" required autofocus>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="hideModal()">Cancel</button>
                <button type="submit" class="btn-primary">Create</button>
            </div>
        </form>
    `);
    document.getElementById('board-name').focus();
    
    document.getElementById('add-board-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('board-name').value.trim();
        if (name) {
            await createBoard(name);
        }
    });
}

/**
 * Show modal form for editing an existing board.
 */
function showEditBoardModal(boardId) {
    const board = boards.find(b => b.id === boardId);
    if (!board) return;

    showModal(`
        <h3>Edit Board</h3>
        <form id="edit-board-form">
            <div class="form-group">
                <label for="edit-board-name">Board Name</label>
                <input type="text" id="edit-board-name" required autofocus value="${escapeHtml(board.name || '')}">
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="hideModal()">Cancel</button>
                <button type="submit" class="btn-primary">Save</button>
            </div>
        </form>
    `);

    document.getElementById('edit-board-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('edit-board-name').value.trim();
        if (!name) return;
        await updateBoard(boardId, name);
    });
}

/**
 * Show modal form for creating a new list
 */
function showAddListModal(boardId) {
    showModal(`
        <h3>Add New List</h3>
        <form id="add-list-form">
            <div class="form-group">
                <label for="list-name">List Name</label>
                <input type="text" id="list-name" required autofocus>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="hideModal()">Cancel</button>
                <button type="submit" class="btn-primary">Create</button>
            </div>
        </form>
    `);
    document.getElementById('list-name').focus();
    
    document.getElementById('add-list-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('list-name').value.trim();
        if (name) {
            await createList(name, boardId);
        }
    });
}

/**
 * Show modal form for editing an existing list.
 */
function showEditListModal(listId) {
    const list = lists.find(l => l.id === listId);
    if (!list) return;

    showModal(`
        <h3>Edit List</h3>
        <form id="edit-list-form">
            <div class="form-group">
                <label for="edit-list-name">List Name</label>
                <input type="text" id="edit-list-name" required autofocus value="${escapeHtml(list.name || '')}">
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="hideModal()">Cancel</button>
                <button type="submit" class="btn-primary">Save</button>
            </div>
        </form>
    `);

    document.getElementById('edit-list-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('edit-list-name').value.trim();
        if (!name) return;
        await updateList(listId, name);
    });
}

/**
 * Show modal form for creating a new card
 */
function showAddCardModal(listId) {
    showModal(`
        <h3>Add New Card</h3>
        <form id="add-card-form">
            <div class="form-group">
                <label for="card-title">Title</label>
                <input type="text" id="card-title" required autofocus>
            </div>
            <div class="form-group">
                <label for="card-description">Description (optional)</label>
                <textarea id="card-description" rows="3"></textarea>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="hideModal()">Cancel</button>
                <button type="submit" class="btn-primary">Create</button>
            </div>
        </form>
    `);
    document.getElementById('card-title').focus();
    
    document.getElementById('add-card-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('card-title').value.trim();
        const description = document.getElementById('card-description').value.trim();
        if (title) {
            await createCard(title, description, listId);
        }
    });
}

/**
 * Show modal form for editing an existing card (including moving it to another list).
 */
function showEditCardModal(cardId) {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;

    const listOptions = lists
        .map(l => `<option value="${l.id}" ${l.id === card.listId ? 'selected' : ''}>${escapeHtml(l.name)}</option>`)
        .join('');

    showModal(`
        <h3>Edit Card</h3>
        <form id="edit-card-form">
            <div class="form-group">
                <label for="edit-card-title">Title</label>
                <input type="text" id="edit-card-title" required autofocus value="${escapeHtml(card.title || '')}">
            </div>
            <div class="form-group">
                <label for="edit-card-description">Description</label>
                <textarea id="edit-card-description" rows="3">${escapeHtml(card.description || '')}</textarea>
            </div>
            <div class="form-group">
                <label for="edit-card-list">List</label>
                <select id="edit-card-list">${listOptions}</select>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="hideModal()">Cancel</button>
                <button type="submit" class="btn-primary">Save</button>
            </div>
        </form>
    `);

    document.getElementById('edit-card-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('edit-card-title').value.trim();
        const description = document.getElementById('edit-card-description').value.trim();
        const listId = Number(document.getElementById('edit-card-list').value);
        if (!title || !listId) return;
        await updateCard(cardId, title, description, listId);
    });
}

// ===== API OPERATIONS =====

/**
 * Create a new board via API
 */
async function createBoard(name) {
    try {
        const response = await apiFetch('/boards', {
            method: 'POST',
            body: JSON.stringify({ name })
        });

        if (response.status === 401) {
            alert('Please log in to create boards.');
            return;
        }
        if (!response.ok) throw new Error(`Failed to create board: ${response.status}`);
        
        const board = await response.json();
        boards.push(board);
        hideModal();
        renderBoards();
    } catch (error) {
        console.error('Error creating board:', error);
        alert('Failed to create board. Please try again.');
    }
}

/**
 * Create a new list via API
 */
async function createList(name, boardId) {
    try {
        const response = await apiFetch('/lists', {
            method: 'POST',
            body: JSON.stringify({ name, boardId })
        });

        if (response.status === 401) {
            alert('Please log in to create lists.');
            return;
        }
        if (!response.ok) throw new Error(`Failed to create list: ${response.status}`);
        
        const list = await response.json();
        lists.push(list);
        hideModal();
        renderBoards();
    } catch (error) {
        console.error('Error creating list:', error);
        alert('Failed to create list. Please try again.');
    }
}

/**
 * Create a new card via API
 */
async function createCard(title, description, listId) {
    try {
        const response = await apiFetch('/cards', {
            method: 'POST',
            body: JSON.stringify({ title, description, listId })
        });

        if (response.status === 401) {
            alert('Please log in to create cards.');
            return;
        }
        if (!response.ok) throw new Error(`Failed to create card: ${response.status}`);
        
        const card = await response.json();
        cards.push(card);
        hideModal();
        renderBoards();
    } catch (error) {
        console.error('Error creating card:', error);
        alert('Failed to create card. Please try again.');
    }
}

/**
 * Update an existing board via API
 */
async function updateBoard(id, name) {
    try {
        const response = await apiFetch(`/boards/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ name })
        });

        if (response.status === 401) {
            alert('Please log in to edit boards.');
            return;
        }
        if (!response.ok) throw new Error(`Failed to update board: ${response.status}`);
        
        const board = await response.json();
        const idx = boards.findIndex(b => b.id === id);
        if (idx !== -1) boards[idx] = board;
        hideModal();
        renderBoards();
    } catch (error) {
        console.error('Error updating board:', error);
        alert('Failed to update board. Please try again.');
    }
}

/**
 * Update an existing list via API
 */
async function updateList(id, name) {
    try {
        const existing = lists.find(l => l.id === id);
        if (!existing) throw new Error('List not found in state');

        const response = await apiFetch(`/lists/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ name, boardId: existing.boardId })
        });

        if (response.status === 401) {
            alert('Please log in to edit lists.');
            return;
        }
        if (!response.ok) throw new Error(`Failed to update list: ${response.status}`);
        
        const list = await response.json();
        const idx = lists.findIndex(l => l.id === id);
        if (idx !== -1) lists[idx] = list;
        hideModal();
        renderBoards();
    } catch (error) {
        console.error('Error updating list:', error);
        alert('Failed to update list. Please try again.');
    }
}

/**
 * Update an existing card via API
 */
async function updateCard(id, title, description, listId) {
    try {
        const existing = cards.find(c => c.id === id);
        if (!existing) throw new Error('Card not found in state');
        const nextListId = Number.isFinite(listId) ? listId : existing.listId;

        const response = await apiFetch(`/cards/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ title, description, listId: nextListId })
        });

        if (response.status === 401) {
            alert('Please log in to edit cards.');
            return;
        }
        if (!response.ok) throw new Error(`Failed to update card: ${response.status}`);
        
        const card = await response.json();
        const idx = cards.findIndex(c => c.id === id);
        if (idx !== -1) cards[idx] = card;
        hideModal();
        renderBoards();
    } catch (error) {
        console.error('Error updating card:', error);
        alert('Failed to update card. Please try again.');
    }
}

// ===== DELETE OPERATIONS =====

/**
 * Delete a board and all its related lists and cards
 */
async function deleteBoard(id) {
    if (!confirm('Are you sure you want to delete this board?')) return;
    try {
        const response = await apiFetch(`/boards/${id}`, { method: 'DELETE' });
        if (response.status === 401) {
            alert('Please log in to delete boards.');
            return;
        }
        if (!response.ok) throw new Error(`Failed to delete board: ${response.status}`);

        const deletedListIds = new Set(lists.filter(l => l.boardId === id).map(l => l.id));
        boards = boards.filter(b => b.id !== id);
        lists = lists.filter(l => l.boardId !== id);
        cards = cards.filter(c => !deletedListIds.has(c.listId));
        renderBoards();
    } catch (error) {
        console.error('Error deleting board:', error);
        alert('Failed to delete board. Please try again.');
    }
}

/**
 * Delete a list and all its cards
 */
async function deleteList(id) {
    if (!confirm('Are you sure you want to delete this list?')) return;
    try {
        const response = await apiFetch(`/lists/${id}`, { method: 'DELETE' });
        if (response.status === 401) {
            alert('Please log in to delete lists.');
            return;
        }
        if (!response.ok) throw new Error(`Failed to delete list: ${response.status}`);
        
        lists = lists.filter(l => l.id !== id);
        cards = cards.filter(c => c.listId !== id);
        renderBoards();
    } catch (error) {
        console.error('Error deleting list:', error);
        alert('Failed to delete list. Please try again.');
    }
}

/**
 * Delete a single card
 */
async function deleteCard(id) {
    if (!confirm('Are you sure you want to delete this card?')) return;
    try {
        const response = await apiFetch(`/cards/${id}`, { method: 'DELETE' });
        if (response.status === 401) {
            alert('Please log in to delete cards.');
            return;
        }
        if (!response.ok) throw new Error(`Failed to delete card: ${response.status}`);
        
        cards = cards.filter(c => c.id !== id);
        renderBoards();
    } catch (error) {
        console.error('Error deleting card:', error);
        alert('Failed to delete card. Please try again.');
    }
}
