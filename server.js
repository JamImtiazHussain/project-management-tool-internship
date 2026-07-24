const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const DB_FILE = path.join(__dirname, 'data', 'db.json');

function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], projects: [], tasks: [], comments: [] }, null, 2));
  }
  const data = fs.readFileSync(DB_FILE);
  return JSON.parse(data);
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Auth: Register
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'All fields required' });
  const db = readDB();
  if (db.users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'User already exists' });
  }
  const newUser = { id: Date.now().toString(), username, password };
  db.users.push(newUser);
  writeDB(db);
  res.json({ success: true, user: { id: newUser.id, username: newUser.username } });
});

// Auth: Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const db = readDB();
  const user = db.users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });
  res.json({ success: true, user: { id: user.id, username: user.username } });
});

// Get Projects & Related Data
app.get('/api/projects', (req, res) => {
  const db = readDB();
  res.json(db.projects);
});

// Create Project
app.post('/api/projects', (req, res) => {
  const { title, description } = req.body;
  const db = readDB();
  const newProject = { id: Date.now().toString(), title, description };
  db.projects.push(newProject);
  writeDB(db);
  res.json(newProject);
});

// Get Tasks for a Project
app.get('/api/projects/:projectId/tasks', (req, res) => {
  const db = readDB();
  const tasks = db.tasks.filter(t => t.projectId === req.params.projectId);
  res.json(tasks);
});

// Create Task
app.post('/api/projects/:projectId/tasks', (req, res) => {
  const { title, assignedTo, status } = req.body;
  const db = readDB();
  const newTask = {
    id: Date.now().toString(),
    projectId: req.params.projectId,
    title,
    assignedTo: assignedTo || 'Unassigned',
    status: status || 'To Do'
  };
  db.tasks.push(newTask);
  writeDB(db);
  res.json(newTask);
});

// Get Comments for a Task
app.get('/api/tasks/:taskId/comments', (req, res) => {
  const db = readDB();
  const comments = db.comments.filter(c => c.taskId === req.params.taskId);
  res.json(comments);
});

// Add Comment to a Task
app.post('/api/tasks/:taskId/comments', (req, res) => {
  const { username, text } = req.body;
  const db = readDB();
  const newComment = {
    id: Date.now().toString(),
    taskId: req.params.taskId,
    username,
    text
  };
  db.comments.push(newComment);
  writeDB(db);
  res.json(newComment);
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));