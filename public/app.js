const API_URL = 'http://localhost:3000/api';
let isLoginMode = true;

// Safely get user from localStorage
let currentUser = null;
try {
    const storedUser = localStorage.getItem('user');
    if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
        currentUser = JSON.parse(storedUser);
    }
} catch (e) {
    localStorage.removeItem('user');
}

let currentProjectId = null;

document.addEventListener('DOMContentLoaded', () => {
    const authForm = document.getElementById('auth-form');
    const toggleAuth = document.getElementById('toggle-auth');
    const submitBtn = document.getElementById('submit-btn');
    const errorMsg = document.getElementById('error-msg');

    if (authForm) {
        if (currentUser && currentUser.id) {
            window.location.href = 'dashboard.html';
            return;
        }

        toggleAuth.addEventListener('click', (e) => {
            e.preventDefault();
            isLoginMode = !isLoginMode;
            if (isLoginMode) {
                submitBtn.innerText = 'Login';
                toggleAuth.innerText = 'Need an account? Register';
            } else {
                submitBtn.innerText = 'Register';
                toggleAuth.innerText = 'Already have an account? Login';
            }
            errorMsg.innerText = '';
        });

        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorMsg.innerText = '';
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();
            const endpoint = isLoginMode ? '/login' : '/register';

            try {
                const res = await fetch(API_URL + endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const data = await res.json();
                
                if (res.ok && data.success) {
                    localStorage.setItem('user', JSON.stringify(data.user));
                    window.location.href = 'dashboard.html';
                } else {
                    errorMsg.innerText = data.error || 'Authentication failed';
                }
            } catch (err) {
                errorMsg.innerText = 'Unable to connect to server.';
            }
        });
    }

    // Dashboard Page Logic
    const dashboardLayout = document.getElementById('project-workspace');
    if (dashboardLayout) {
        if (!currentUser || !currentUser.id) {
            window.location.href = 'index.html';
            return;
        }
        document.getElementById('logged-user').innerText = `User: ${currentUser.username}`;
        document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        });

        loadProjects();

        document.getElementById('create-project-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('project-title').value;
            await fetch(API_URL + '/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title })
            });
            document.getElementById('project-title').value = '';
            loadProjects();
        });

        document.getElementById('create-task-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('task-title').value;
            const assignedTo = document.getElementById('task-assignee').value;
            await fetch(`${API_URL}/projects/${currentProjectId}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, assignedTo })
            });
            document.getElementById('task-title').value = '';
            document.getElementById('task-assignee').value = '';
            loadTasks(currentProjectId);
        });
    }
});

async function loadProjects() {
    const res = await fetch(API_URL + '/projects');
    const projects = await res.json();
    const list = document.getElementById('project-list');
    list.innerHTML = '';
    projects.forEach(p => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="#" onclick="selectProject('${p.id}', '${p.title}')">${p.title}</a>`;
        list.appendChild(li);
    });
}

async function selectProject(id, title) {
    currentProjectId = id;
    document.getElementById('project-workspace').style.display = 'block';
    document.getElementById('current-project-title').innerText = title;
    loadTasks(id);
}

async function loadTasks(projectId) {
    const res = await fetch(`${API_URL}/projects/${projectId}/tasks`);
    const tasks = await res.json();
    
    document.getElementById('tasks-todo').innerHTML = '';
    document.getElementById('tasks-inprogress').innerHTML = '';
    document.getElementById('tasks-done').innerHTML = '';

    for (const t of tasks) {
        const card = document.createElement('div');
        card.className = 'task-card';
        card.innerHTML = `
            <strong>${t.title}</strong><br>
            <small>Assigned: ${t.assignedTo}</small>
            <div class="comments-section" id="comments-${t.id}">
                <div id="comment-list-${t.id}"></div>
                <input type="text" id="comment-input-${t.id}" placeholder="Add comment...">
                <button onclick="addComment('${t.id}')">Post</button>
            </div>
        `;

        if (t.status === 'To Do') document.getElementById('tasks-todo').appendChild(card);
        else if (t.status === 'In Progress') document.getElementById('tasks-inprogress').appendChild(card);
        else document.getElementById('tasks-done').appendChild(card);

        loadComments(t.id);
    }
}

async function loadComments(taskId) {
    const res = await fetch(`${API_URL}/tasks/${taskId}/comments`);
    const comments = await res.json();
    const container = document.getElementById(`comment-list-${taskId}`);
    container.innerHTML = comments.map(c => `<div><b>${c.username}:</b> ${c.text}</div>`).join('');
}

async function addComment(taskId) {
    const input = document.getElementById(`comment-input-${taskId}`);
    const text = input.value;
    if (!text) return;
    const currentUser = JSON.parse(localStorage.getItem('user'));
    
    await fetch(`${API_URL}/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser.username, text })
    });
    input.value = '';
    loadComments(taskId);
}