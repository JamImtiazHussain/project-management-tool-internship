# Project Management Tool

A lightweight full-stack collaborative project management and task tracking web application inspired by Trello and Asana.

## Features
- **User Authentication:** Secure registration and login system.
- **Project Boards:** Create and manage multiple group projects.
- **Task Management:** Add tasks, assign them to team members, and track them across status columns.
- **Interactive Communication:** Post and view comments directly within task cards.

## Tech Stack
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Node.js, Express.js
- **Database:** JSON file-based storage (`db.json`)

## Project Structure
```text
project-management-tool/
│
├── server/
│   ├── data/
│   │   └── db.json
│   ├── server.js
│   └── package.json
│
└── public/
    ├── index.html
    ├── dashboard.html
    ├── style.css
    └── app.js
```

## Getting Started

### Prerequisites
- Node.js installed on your machine.

### Installation & Running
1. Open your terminal and navigate into the `server` directory:
   ```bash
   cd server
   ```
2. Install the required dependencies:
   ```bash
   npm install
   ```
3. Start the backend server:
   ```bash
   npm start
   ```
4. Open your browser and go to:
   ```text
   http://localhost:3000
   ```
