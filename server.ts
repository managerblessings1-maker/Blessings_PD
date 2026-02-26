import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("levelup.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT CHECK(priority IN ('High', 'Medium', 'Low')),
    date TEXT,
    completed INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS finance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT CHECK(type IN ('Income', 'Expense')),
    amount REAL NOT NULL,
    category TEXT,
    note TEXT,
    date TEXT
  );

  CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    timeSpent INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    completed INTEGER DEFAULT 0,
    lastUpdated TEXT
  );

  CREATE TABLE IF NOT EXISTS videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    link TEXT NOT NULL,
    category TEXT,
    watched INTEGER DEFAULT 0
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  
  // Tasks
  app.get("/api/tasks", (req, res) => {
    const tasks = db.prepare("SELECT * FROM tasks ORDER BY CASE priority WHEN 'High' THEN 1 WHEN 'Medium' THEN 2 WHEN 'Low' THEN 3 END").all();
    res.json(tasks);
  });

  app.post("/api/tasks", (req, res) => {
    const { title, description, priority, date } = req.body;
    const info = db.prepare("INSERT INTO tasks (title, description, priority, date) VALUES (?, ?, ?, ?)").run(title, description, priority, date);
    res.json({ id: info.lastInsertRowid });
  });

  app.patch("/api/tasks/:id", (req, res) => {
    const { completed } = req.body;
    db.prepare("UPDATE tasks SET completed = ? WHERE id = ?").run(completed ? 1 : 0, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/tasks/:id", (req, res) => {
    db.prepare("DELETE FROM tasks WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Finance
  app.get("/api/finance", (req, res) => {
    const items = db.prepare("SELECT * FROM finance ORDER BY date DESC").all();
    res.json(items);
  });

  app.post("/api/finance", (req, res) => {
    const { type, amount, category, note, date } = req.body;
    const info = db.prepare("INSERT INTO finance (type, amount, category, note, date) VALUES (?, ?, ?, ?, ?)").run(type, amount, category, note, date);
    res.json({ id: info.lastInsertRowid });
  });

  // Skills
  app.get("/api/skills", (req, res) => {
    const skills = db.prepare("SELECT * FROM skills").all();
    res.json(skills);
  });

  app.post("/api/skills", (req, res) => {
    const { name } = req.body;
    const info = db.prepare("INSERT INTO skills (name, timeSpent, streak, completed) VALUES (?, 0, 0, 0)").run(name);
    res.json({ id: info.lastInsertRowid });
  });

  app.patch("/api/skills/:id", (req, res) => {
    const { timeSpent, streak, completed, lastUpdated } = req.body;
    db.prepare("UPDATE skills SET timeSpent = ?, streak = ?, completed = ?, lastUpdated = ? WHERE id = ?")
      .run(timeSpent, streak, completed ? 1 : 0, lastUpdated, req.params.id);
    res.json({ success: true });
  });

  // Videos
  app.get("/api/videos", (req, res) => {
    const videos = db.prepare("SELECT * FROM videos").all();
    res.json(videos);
  });

  app.post("/api/videos", (req, res) => {
    const { title, link, category } = req.body;
    const info = db.prepare("INSERT INTO videos (title, link, category) VALUES (?, ?, ?)").run(title, link, category);
    res.json({ id: info.lastInsertRowid });
  });

  app.patch("/api/videos/:id", (req, res) => {
    const { watched } = req.body;
    db.prepare("UPDATE videos SET watched = ? WHERE id = ?").run(watched ? 1 : 0, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/videos/:id", (req, res) => {
    db.prepare("DELETE FROM videos WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
