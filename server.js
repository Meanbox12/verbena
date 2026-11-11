const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("node:path");

const app = express();
const db = new sqlite3.Database("verbena.db");

app.use(express.static(path.join(__dirname, "/public")));
app.use(express.json());

const createTable = `
CREATE TABLE IF NOT EXISTS posts (
id INTEGER PRIMARY KEY AUTOINCREMENT,
type INTEGER NOT NULL,
title TEXT NOT NULL,
content TEXT NOT NULL,
created_at TEXT NOT NULL,
modified_at TEXT NOT NULL
)
`

db.run(createTable, (err) => {
    if (err) {
        return console.log("error: " + err.message);
    }
});

// My spot to run random SQL commands
const randomCommand = "";
if (randomCommand != "") {
    db.run(randomCommand, (err) => {
        if (err) {
            return console.log("error: " + err.message);
        }
        console.log("Did the thing");
    });
}

app.post("/api/create", (req, res) => {

    console.log(req);

    console.log(req.body);

    let title = req.body.title;
    let content = req.body.content;
    let time = new Date();

    db.run(`INSERT INTO posts (type, title, content, created_at, modified_at) VALUES (1, "${title}", "${content}", "${time.toLocaleString()}", "${time.toLocaleString()}"   )`, (err, row) => {
        if (err) {
            return console.log(err.message);
        }
    });
});

app.get("/api/post/:postid", (req, res, next) => {
    db.get("SELECT title, content, created_at FROM posts WHERE rowid = ?", [req.params.postid], (err, row) => {
        if (err) {
            return console.log(err.message);
        }

        if (row) {
            res.json(row);
        } else {
            res.send("Invalid post.");
        }
    });
});

app.get("/api/posts", (req, res) => {
    db.all("SELECT * FROM posts WHERE type = 1", (err, content) => {
        if (err) {
            return console.log(err.message);
        }

        res.json(content);
    });
});

app.get("/api/postcount", (req, res) => {
    db.get("SELECT COUNT() FROM posts WHERE type = 1", (err, count) => {
        if (err) {
            return console.log(err.message);
        }

        res.send(count["COUNT()"]);
    });
});

app.get("/api/info", (req, res, next) => {
    res.json({ "title": "Verbena", "subtitle": "Welcome to Verbena!" });
});

app.get("/post/:postid", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/edit", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

db.get("SELECT COUNT() FROM posts WHERE type = 1", (err, count) => {
    if (err) {
        return console.log(err.message);
    }

    console.log(`Post Count: ${count["COUNT()"]}`);
});

app.listen(4000, () => {
    console.log(`Server is online at 127.0.0.1:4000`);
});
