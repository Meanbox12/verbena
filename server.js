const express = require("express");
const multer = require("multer");
const sqlite3 = require("sqlite3").verbose();
const path = require("node:path");
const fs = require("node:fs");

const app = express();
app.disable("x-powered-by");

// TODO: Make the size limit a changeable setting
const upload = multer({ dest: "public/uploads/temp/", limits: { fileSize: 1000000 } });
let db;

const PORT = 4000;
const INDEXFILE = path.join(__dirname, "public", "index.html");

app.use(express.static(path.join(__dirname, "/public")));
app.use(express.json());

// My spot to run random SQL commands
const randomCommand = "";
if (randomCommand != "") {
    db.run(randomCommand, (err) => {
        if (err) {
            return console.error("error: " + err.message);
        }
        console.log("Did the thing");
    });
}

/**
 * Loads the SQLite database.
 * @param {String} fileName The filename to load the database from.
 * @returns An error if the tables fail to load, or true if they load successfully.
 */
async function loadDatabase(fileName) {
    db = new sqlite3.Database(fileName);

    const postsTableCommand = `
    CREATE TABLE IF NOT EXISTS posts (
    number INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL UNIQUE,
    id TEXT NOT NULL UNIQUE,
    type INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    created_at TEXT NOT NULL,
    modified_at TEXT NOT NULL
    )
    `

    const infoTableCommand = `
    CREATE TABLE IF NOT EXISTS info (
    type INTEGER PRIMARY KEY,
    content TEXT NOT NULL
    )
    `

    db.run(postsTableCommand, (err) => {
        if (err) {
            return err;
        }
    });

    db.run(infoTableCommand, (err) => {
        if (err) {
            return err;
        }
    });

    let updatedCount = await getPostCount();

    // Update the row count
    db.run("UPDATE sqlite_sequence SET seq = ? WHERE name = ?", [updatedCount, "posts"], async (err) => {
        if (err) {
            console.error(err.message);
            return;
        }

        console.log("Updated the post count to " + updatedCount);
    });

    return true;
}

/**
 * Gets the current post count.
 * @returns {Promise} A Promise that resolves to the current post count.
 */
async function getPostCount() {

    return new Promise((resolve, reject) => {
        db.get("SELECT COUNT() FROM posts", (err, count) => {
            if (err) {
                console.error(err.message);
                return reject(err);
            }

            let parsedCount = Number.parseInt(count["COUNT()"]);
            resolve(parsedCount);
        });
    });
}

// TODO: Repurpose this function into a general generator that takes a length input

/**
 * Generates a unique post ID that is not in use by any other post.
 * @returns {String} The generated post ID.
 */
async function generatePostId() {

    let id;
    let letters = ["a", "b", "c", "d", "e", "f"];
    let valid = false;
    let tries = 0;

    while (!valid && tries < 100) {

        id = "";

        for (let i = 0; i < 6; i++) {
            let char = Math.floor(Math.random() * 16);
            if (char > 9) {
                char = letters[char - 10];
            }
            id += char;
        }

        valid = await new Promise((resolve, reject) => {  // NOSONAR
            db.get("SELECT id FROM posts WHERE id = ?", [id], (err, row) => {
                if (err) {
                    return reject(err);
                }

                if (row) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            })
        });
    }

    return id;
}

/**
 * Adds a new post to the databse.
 * @param {Number} type The type of the post.
 * @param {String} title The title of the post.
 * @param {String} content The content of the post.
 * @returns {Promise} A Promise that will either resolve to the newly created post or an error message if the creation fails.
 */
async function createPost(type, title, content) {

    let time = Date.now();
    let id = await generatePostId();

    return new Promise((resolve, reject) => {
        db.get("INSERT INTO posts (id, type, title, content, created_at, modified_at) VALUES (?, ?, ?, ?, ?, ?) RETURNING *", [id, type, title, content, time, time], (err, row) => {
            if (err) {
                return reject(err);
            }

            resolve(row);

            console.log("Created new post with ID " + row.id);
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
function editPost(id, type, title, content) {

    let time = Date.now();

    return new Promise((resolve, reject) => {

        if (id == "sidebar") {
            db.get("UPDATE info SET content = ? WHERE id = 4 RETURNING *", [content], (err, row) => {
                if (err) {
                    return reject(err);
                }

                resolve(row);
            });
        } else {
            db.get("UPDATE posts SET type = ?, title = ?, content = ?, modified_at = ? WHERE id = ? RETURNING *", [type, title, content, time, id], (err, row) => {
                if (err) {
                    return reject(err);
                }

                resolve(row);
            });
        }
    });
}

/**
 * Deletes a post from the database.
 * @param {String} id The post ID to be deleted.
 * @returns {Promise} A Promise that will either resolve to the deleted post or an error message if the delete fails.
 */
async function deletePost(id) {

    return new Promise((resolve, reject) => {

        // Delete the post
        db.get("DELETE FROM posts WHERE id = ? RETURNING *", [id], async (err, row) => {
            if (err) {
                return reject(err);
            }

            // Reindex post IDs
            db.run("UPDATE posts SET number = number - 1 WHERE number > ?", [row.number], async (err) => {
                if (err) {
                    return reject(err);
                }

                // Update the row count
                db.run("UPDATE sqlite_sequence SET seq = ? WHERE name = ?", [await getPostCount() - 1, "posts"], (err) => {
                    if (err) {
                        return reject(err);
                    }

                    resolve(row);
                });
            });

            /*
            for (let i = (row.number + 1); i <= postCount; i++) {

                await new Promise((resolve, reject) => {
                    db.get("UPDATE posts SET number = ? WHERE number = ? RETURNING *", [i - 1, i], (err, row) => {
                        if (err) {
                            return reject(err);
                        }

                        resolve(row);
                    });
                });
            }
                */

        });
    });
}

app.post("/api/create", async (req, res) => {
    try {
        if (!req.body.title || req.body.title == "") {
            res.status(400).send("Post title cannot be empty.");
            return;
        }
        let createdPost = await createPost(req.body.type, req.body.title, req.body.content);
        res.status(201).send(createdPost.id);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.put("/api/edit/:postid", async (req, res) => {
    try {
        if (!req.body.title || req.body.title == "") {
            res.status(400).send("Post title cannot be empty.");
            return;
        }

        let editedPost = await editPost(req.body.id, req.body.type, req.body.title, req.body.content);
        res.status(200).send(editedPost.id);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.delete("/api/delete/:postid", async (req, res) => {
    try {
        let deletedPost = await deletePost(req.params.postid);
        res.send(deletedPost.id);
    } catch (err) {
        res.send(false);
        console.error(err.message);
    }
});

app.get("/api/post/:postid", (req, res) => {
    db.get("SELECT * FROM posts WHERE id = ?", [req.params.postid], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.send(err.message);
        }

        if (row) {
            res.json(row);
        } else {
            res.send("Post " + req.params.postid + " does not exist.");
        }
    });
});

app.get("/api/search/:title", (req, res) => {
    db.all("SELECT * FROM posts WHERE LOWER(title) LIKE LOWER(?)", [`%${req.params.title}%`], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send(err.message);
        }

        if (row) {
            res.status(200).json(row);
        } else {
            res.send("Nothing found");
        }
    });
});

app.get("/api/posts", (req, res) => {
    db.all("SELECT * FROM posts WHERE type = 1", (err, content) => {
        if (err) {
            return console.error(err.message);
        }

        res.json(content);
    });
});

app.get("/api/postcount", (req, res) => {
    db.get("SELECT COUNT() FROM posts WHERE type = 1", (err, count) => {
        if (err) {
            return console.error(err.message);
        }

        res.send(count["COUNT()"]);
    });
});

app.get("/api/info/:infoid", (req, res) => {

    db.get("SELECT content FROM info WHERE id = ?", [req.params.infoid], (err, row) => {
        if (err) {
            return console.error(err.message);
        }

        if (row) {
            res.json(row);
        } else {
            res.send("Invalid request.");
        }
    });
});

app.get("/api/info", (req, res) => {

    db.all("SELECT * FROM info", (err, content) => {
        if (err) {
            return console.error(err.message);
        }

        if (content) {
            res.json(content);
        } else {
            res.send("Invalid request.");
        }
    });
});

async function hash(input) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);

    const hashBuffer = await crypto.subtle.digest("SHA-256", data);

    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");

    return hashHex;
}

// TODO: Clean orphaned uploads??
app.post("/api/upload", upload.single("file"), async (req, res) => {

    try {

        if (!req.file) {
            res.status(400).send("Server did not recieve a file.");
            return;
        }

        let originalName = req.file.originalname;
        let originalNameParts = originalName.split(".");
        let extension = originalNameParts[originalNameParts.length - 1];

        let parsedFile = fs.readFileSync(req.file.path);

        let fileHash = await hash(parsedFile);

        if (fs.readdirSync("public/uploads").some(item => item.includes(fileHash))) {
            fs.unlinkSync(req.file.path);
            res.status(200).send("/uploads/" + fileHash + "." + extension);
        } else {
            fs.renameSync(req.file.path, "public/uploads/" + fileHash + "." + extension);
            res.status(201).send("/uploads/" + fileHash + "." + extension);
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.get("/post/:postid", (req, res) => {
    res.sendFile(INDEXFILE);
});

app.get("/edit", (req, res) => {
    res.sendFile(INDEXFILE);
});

app.get("/search", (req, res) => {
    res.sendFile(INDEXFILE);
});

app.get("/", (req, res) => {
    res.sendFile(INDEXFILE);
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
