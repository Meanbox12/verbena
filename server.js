const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const db = new sqlite3.Database("verbena.db");

app.use(express.static(__dirname + "/public"));

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
    console.log("Created the table");
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

app.get("/posts/:postid", (req, res, next) => {
    db.get("SELECT title, content, created_at FROM posts WHERE rowid = ?", [req.params.postid], (err, row) => {
        if (err) {
            return console.log(err.message);
        }

        res.json(row);
    });
});

app.get("/info", (req, res, next) => {
    res.json({ "title": "Verbena", "subtitle": "Welcome to Verbena!" });
});

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

db.get("SELECT COUNT() FROM posts", (err, count) => {
    if (err) {
        return console.log(err.message);
    }

    console.log(`Post Count: ${count["COUNT()"]}`);
});

app.listen(4000, () => {
    console.log(`Server is online at 127.0.0.1:4000`);
});
