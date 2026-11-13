const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("node:path");

const app = express();
let db;

app.use(express.static(path.join(__dirname, "/public")));
app.use(express.json());

async function loadDatabase(fileName) {
    db = await new sqlite3.Database(fileName);

    return createDB();
}

function createDB() {
    const createTable1 = `
    CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL,
    modified_at TEXT NOT NULL
    )
    `
    const createTable2 = `
    CREATE TABLE IF NOT EXISTS info (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL
    )
    `

    db.run(createTable1, (err) => {
        if (err) {
            return err;
        }
    });

    db.run(createTable2, (err) => {
        if (err) {
            return err;
        }
    });

    return true;
}

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

async function createPost(type, title, content) {

    let time = new Date().toLocaleString();

    return new Promise((resolve, reject) => {
        db.get(`INSERT INTO posts (type, title, content, created_at, modified_at) VALUES (?, ?, ?, ?, ?) RETURNING *`, [type, title, content, time, time], async (err, row) => {
            if (err) {
                reject(err);
            }

            resolve(row);
        });
    });
}

// TODO: Write this function
function modifyPost(id, type, title, content) {

}

app.post("/api/create", async (req, res) => {
    try {
        let createdPost = await createPost(req.body.type, req.body.title, req.body.content);
        res.send(createdPost.id);
    } catch (err) {
        res.send(false);
        console.log(err.message);
    }
});

app.get("/api/post/:postid", (req, res, next) => {
    db.get("SELECT id, title, content, created_at FROM posts WHERE rowid = ?", [req.params.postid], (err, row) => {
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

app.listen(4000, async function () {

    let dbStatus = await loadDatabase("verbena.db");

    if (dbStatus) {
        console.log("Databases were successfully loaded.");
    } else {
        console.log("An error occured when loading databases: " + dbStatus.message);
        return;
    }
    console.log(`Server is online at 127.0.0.1:4000`);
});
