const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("node:path");

const app = express();
let db;

const PORT = 4000;

app.use(express.static(path.join(__dirname, "/public")));
app.use(express.json());

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

// TODO: Replace all the SQL command string literals with quotes and put the variables outside of the strings

/**
 * Loads the SQLite database.
 * @param {String} fileName The filename to load the database from.
 * @returns An error if the tables fail to load, or true if they load successfully.
 */
async function loadDatabase(fileName) {
    db = await new sqlite3.Database(fileName);

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

/**
 * Adds a new post to the databse.
 * @param {Number} type The type of the post.
 * @param {String} title The title of the post.
 * @param {String} content The content of the post.
 * @returns {Promise} A Promise that will either resolve to the newly created post or an error message if the creation fails.
 */
function createPost(type, title, content) {

    let time = Date.now();

    return new Promise((resolve, reject) => {
        db.get("INSERT INTO posts (type, title, content, created_at, modified_at) VALUES (?, ?, ?, ?, ?) RETURNING *", [type, title, content, time, time], (err, row) => {
            if (err) {
                reject(err);
            }

            resolve(row);
        });
    });
}

/**
 * Edits a post in the database.
 * @param {Number} id The post ID to be edited.
 * @param {Number} type The new type of the post.
 * @param {String} title The new title of the post.
 * @param {String} content The new content of the post.
 * @returns {Promise} A Promise that will either resolve to the edited post or an error message if the edit fails.
 */
function modifyPost(id, type, title, content) {
    let time = Date.now();

    return new Promise((resolve, reject) => {
        db.get("UPDATE posts SET type = ?, title = ?, content = ?, modified_at = ? WHERE id = ? RETURNING *", [type, title, content, time, id], (err, row) => {
            if (err) {
                reject(err);
            }

            resolve(row);
        });
    });
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

app.listen(PORT, async function () {

    let dbStatus = await loadDatabase("verbena.db");

    if (dbStatus) {
        console.log("Databases were successfully loaded.");
    } else {
        console.log("An error occured when loading databases: " + dbStatus.message);
        return;
    }
    console.log(`Server is online at 127.0.0.1:${PORT}`);
});
