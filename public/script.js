const postPage = document.getElementById("post-page");
const listPage = document.getElementById("list-page");
const editPage = document.getElementById("edit-page");
const errorPage = document.getElementById("error-page");
const sidebar = document.getElementById("sidebar-links-container");

const headerLogo = document.getElementById("header-logo");
const headerLogoLink = document.getElementById("header-logo-link");
const headerTitle = document.getElementById("header-title");
const headerSubtitle = document.getElementById("header-subtitle");
const headerSearchbarLabel = document.getElementById("header-searchbar-label");

const postPageReturn = document.getElementById("post-page-return");
const postPageTitle = document.getElementById("post-page-title");
const postPageContent = document.getElementById("post-page-content");
const postPageCreated = document.getElementById("post-page-created");
const postPageModified = document.getElementById("post-page-modified");
const postPageNumber = document.getElementById("post-page-number");
const postPagePrevious = document.getElementById("post-page-previous");
const postPageNext = document.getElementById("post-page-next");
const postPageRaw = document.getElementById("post-page-raw");
const postPageEdit = document.getElementById("post-page-edit");
const postPageDelete = document.getElementById("post-page-delete");

const editPageTitle = document.getElementById("edit-page-title");
const editPageReturn = document.getElementById("edit-page-return");
const editPageIdInput = document.getElementById("edit-page-id-input");
const editPageTitleInput = document.getElementById("edit-page-title-input");
const editPageContentInput = document.getElementById("edit-page-content-input");
const editPageSave = document.getElementById("edit-page-save");
const editPageNotice = document.getElementById("edit-page-notice");
const editPagePreviewTitle = document.getElementById("edit-page-preview-title");
const editPagePreview = document.getElementById("edit-page-preview");

const errorPageText = document.getElementById("error-page-text");
const errorPageReturn = document.getElementById("error-page-return");

let postViewId = 0;
let currentPost;
// TODO: Update this variable more often
let totalPosts = 0;
let postViewType = 1;

let faithfulMarkdown = false;
let listPagePopulated = false;

// Functions

/**
 * Parses a markdown string using the Marked library.
 * @param {String} markdown The string to be parsed.
 * @returns The parsed string as HTML.
 */
function parseMarkdown(markdown) {

    let editedMarkdown;

    if (faithfulMarkdown) {
        editedMarkdown = markdown;
    } else {
        // Faithful markdown follows the markdown syntax exactly, but turning it off makes newlines work properly
        editedMarkdown = markdown.replaceAll("\n", "  \n");
    }

    return marked.parse(editedMarkdown);
}

/**
 * Shows a page in the content area of the site.
 * @param {Number} page The page to be shown. 1 = List, 2 = Post, 3 = Edit
 * @param {JSON} data A JSON object containing additional data about how the page should be shown.
 */
async function showPage(page, data) {

    /**
     * Hides all pages in the content area.
     */
    function hideAllPages() {
        listPage.style.display = "none";
        postPage.style.display = "none";
        editPage.style.display = "none";
        errorPage.style.display = "none";
    }

    /**
     * Populates the List page with post elements.
     * @param {Number} page [Currently unused] The page to load posts from.
     */
    async function populateListPage(page) {

        /**
         * Creates a Element for a post.
         * @param {Number} id The post's ID.
         * @param {String} title The post's title.
         * @param {String} content The post's content.
         * @param {String} created_at The post's creation date.
         * @param {String} modified_at The post's last modified date.
         * @returns {Element} The created HTML element.
         */
        function createPostElement(id, title, content, created_at, modified_at) {
            let postElement = document.createElement("div");
            postElement.className = "post"
            postElement.id = "post-" + id;

            let postElementTitle = document.createElement("a");
            postElementTitle.className = "large-text";
            postElementTitle.innerText = title;
            postElementTitle.tabIndex = 0;
            postElement.appendChild(postElementTitle);

            let postElementContent = document.createElement("p");
            postElementContent.className = "post-markdown-container";
            postElementContent.innerHTML = parseMarkdown(content);
            postElement.appendChild(postElementContent);

            // TODO: Add the image viewer

            let postElementInfo = document.createElement("small");
            postElementInfo.className = "small-text";
            let creationDate = new Date(Math.round(created_at)).toLocaleString();
            postElementInfo.innerText = "Created on " + (creationDate == "Invalid Date" ? created_at : creationDate);
            postElement.appendChild(postElementInfo);

            postElementTitle.addEventListener("click", function () {
                showPage(2, { populate: true, history: true, post: { id: id, title: title, content: content, created_at: created_at, modified_at: modified_at } });
            });

            return postElement;
        }


        let postsRaw = await fetch("/api/posts");
        let posts = await postsRaw.json();

        for (let i = posts.length - 1; i >= 0; i--) {
            let postObject = posts[i];
            let postElement = createPostElement(postObject.id, postObject.title, postObject.content, postObject.created_at, postObject.modified_at);
            listPage.appendChild(postElement);
            listPage.appendChild(document.createElement("hr"));
        }
    }

    /**
     * Populates the Post page with a post.
     * @param {Number} id The post's ID.
     * @param {String} title The post's title.
     * @param {String} content The post's content.
     * @param {String} created_at The post's creation date.
     * @param {String} modified_at The post's last modified date.
     */
    function populatePostPage(id, title, content, created_at, modified_at) {
        postPageTitle.innerText = title;
        postPageContent.innerHTML = parseMarkdown(content);
        let creationDate = new Date(Math.round(created_at)).toLocaleString();
        let modifiedDate = new Date(Math.round(modified_at)).toLocaleString();
        postPageCreated.innerText = "Created on " + (creationDate == "Invalid Date" ? created_at : creationDate);
        postPageModified.innerText = "Last modified on " + (modifiedDate == "Invalid Date" ? modified_at : modifiedDate);
        postPageNumber.innerText = "#" + id;
        postViewId = parseInt(id);
    }

    function populateEditPage(id, title, content) {
        editPageIdInput.value = id;
        editPageTitleInput.value = title;
        editPageContentInput.value = content;
    }

    // List Page
    if (page == 1) {
        hideAllPages();
        if (data && data.populate) {
            await populateListPage();
            listPagePopulated = true;
        }

        listPage.style.display = "block";

        if (data && data.history) {
            let object = { "page": 1 }
            window.history.pushState(object, "", "/");
        }
    }

    // Post Page
    else if (page == 2) {

        hideAllPages();
        if (data && data.populate) {
            await populatePostPage(data.post.id, data.post.title, data.post.content, data.post.created_at, data.post.modified_at);
            currentPost = data.post;
        }

        postViewType = 1;
        postPageRaw.innerText = "View Raw";

        postPage.style.display = "block";
        // TODO: Save the scroll position on the site to return the user to where they were if they go back
        window.scroll(0, 0);

        if (data && data.history) {
            let object = { "page": 2, "id": data.post.id };
            window.history.pushState(object, "", "/post/" + data.post.id);
        }
    }

    // Edit Page
    else if (page == 3) {
        hideAllPages();
        editPage.style.display = "flex";

        if (data && data.post) {
            populateEditPage(data.post.id, data.post.title, data.post.content);
        }

        // TODO: Call this somewhere else
        if (editPageTitleInput.value != "") {
            editPagePreviewTitle.innerText = editPageTitleInput.value;
        }

        if (editPageContentInput.value != "") {
            editPagePreview.innerHTML = parseMarkdown(editPageContentInput.value);
        }

        if (data && data.history) {
            let object = { "page": 3 }
            window.history.pushState(object, "", "/edit" + (data.post ? "?post=" + data.post.id : ""));
        }
    }

    // Error Page
    else if (page == 4) {
        hideAllPages();

        if (data && data.message) {
            errorPageText.innerText = data.message;
        }

        errorPage.style.display = "block";
    }

}

// TODO: Add the state setting as another option for this

/**
 * Fetches a post's info from the server using a post ID.
 * @param {Number} id The post ID to be fetched.
 * @returns {JSON} A JSON object in the following format: {id: [Post Id], title: [Post Title], content: [Post Content], created_at: [Post Creation Info]}
 */
async function getPost(id) {
    let postRaw = await fetch("/api/post/" + id);

    let type = postRaw.headers.get("content-type");

    if (type.includes("application/json")) {
        let post = await postRaw.json();
        return post;

        // TODO: Update the server to send an actual error response instead of just text
    } else {
        throw new Error("Invalid post ID " + id);
    }
}

/**
 * Gets the current post count from the server.
 * @returns {Number} The number of posts.
 */
async function getPostCount() {
    return parseInt(await (await fetch("/api/postcount")).text());
}

/**
 * Populates the site's header.
 */
async function populateHeader() {

    let title = (await (await fetch("/api/info/1")).json()).content;
    let subtitle = (await (await fetch("/api/info/2")).json()).content;
    let logo = (await (await fetch("/api/info/3")).json()).content;

    headerLogo.src = logo;
    headerTitle.innerHTML = title;
    headerSubtitle.innerHTML = subtitle;
    headerSearchbarLabel.innerHTML = "Search " + title;
    document.title = title;
}

/**
 * Populates the site's sidebar.
 */
async function populateSidebar() {
    let sidebarPost = await (await fetch("/api/info/4")).json();

    sidebar.innerHTML = sidebarPost.content;
}

// Event Listeners

headerLogoLink.addEventListener("click", function () {
    showPage(1, { history: true, populate: true });
});

postPageReturn.addEventListener("click", function () {
    showPage(1, { history: true, populate: !listPagePopulated });
});

postPagePrevious.addEventListener("click", async function () {
    if (postViewId > 1) {
        let post;
        try {
            post = await getPost(postViewId - 1);
        } catch (err) {
            showPage(4, { message: err.message });
            return;
        }

        showPage(2, { "populate": true, "history": true, "post": post });
    }
});

postPageNext.addEventListener("click", async function () {
    if (postViewId < totalPosts) {

        let post;
        try {
            post = await getPost(postViewId + 1);
        } catch (err) {
            showPage(4, { message: err.message });
            return;
        }

        showPage(2, { "populate": true, "history": true, "post": post });
    }
});

postPageRaw.addEventListener("click", async function () {
    if (postViewType == 1) {
        postPageContent.innerText = currentPost.content;
        postPageRaw.innerText = "View Formatted";
        postViewType = 2;
    } else {
        postPageContent.innerHTML = parseMarkdown(currentPost.content);
        postPageRaw.innerText = "View Raw";
        postViewType = 1;
    }
});

postPageEdit.addEventListener("click", async function () {

    // We fetch the post again here in case it has changed since the user opened it
    let post;

    try {
        post = await getPost(postViewId);
    } catch (err) {
        showPage(4, { message: err.message });
        return;
    }

    showPage(3, { "history": true, "post": { "id": postViewId, "title": post.title, "content": post.content } });
});

// TODO: Make all the return buttons go back in history instead of going straight to the List page
// TODO: Also make moving between post pages not count as a history change for the buttons
editPageReturn.addEventListener("click", function () {
    showPage(1, { history: true, populate: !listPagePopulated });
});

editPageTitleInput.addEventListener("input", function () {
    editPagePreviewTitle.innerText = editPageTitleInput.value;
});

editPageContentInput.addEventListener("input", function () {
    editPagePreview.innerHTML = parseMarkdown(editPageContentInput.value);
});

errorPageReturn.addEventListener("click", function () {
    showPage(1, { history: true, populate: !listPagePopulated });
});

// TODO: Add a confirmatioN!!!!
postPageDelete.addEventListener("click", async function () {

    // alert("The delete button is disabled for now.")
    // return;

    let confirmation = confirm("Are you sure you want to delete the post? This action cannot be undone.");
    
    if (!confirmation) {
        return;
    }

    response = await fetch("/api/delete/" + postViewId, {
        method: "DELETE"
    });

    if (response) {

        let responseText = await response.text();

        if (responseText != "false") {
            alert(`Deleted post ${postViewId}`);
            totalPosts = await getPostCount();
        } else {
            editPageNotice.innerText = "An error occured when creating the post.";
        }
    } else {
        editPageNotice.innerText = "An error occured when creating the post.";
    }
});

editPageSave.addEventListener("click", async function () {

    editPagePreview.innerHTML = parseMarkdown(editPageContentInput.value);

    let editing = false;
    let response;

    if (editPageIdInput.value != "" && editPageIdInput.value <= totalPosts) {
        editing = true;
        response = await fetch("/api/edit/" + editPageIdInput.value, {
            method: "PUT",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({ "id": editPageIdInput.value, "type": 1, "title": editPageTitleInput.value, "content": editPageContentInput.value }),
        });
    } else {
        response = await fetch("/api/create", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({ "type": 1, "title": editPageTitleInput.value, "content": editPageContentInput.value }),
        });
    }

    if (response) {

        let responseText = await response.text();

        if (responseText != "false") {
            if (editing) {
                editPageNotice.innerHTML = `Successfully edited post ${responseText}. Click <a href='/post/${responseText}'>here</a> to view.`;
            } else {
                editPageNotice.innerHTML = `New post created with ID ${responseText}. Click <a href='/post/${responseText}'>here</a> to view.`;
            }
            totalPosts = await getPostCount();
        } else {
            editPageNotice.innerText = "An error occured when creating the post.";
        }
    } else {
        editPageNotice.innerText = "An error occured when creating the post.";
    }
});

// When the browser forward and back buttons are pressed
onpopstate = async function (event) {
    if (event.state.page == 1) {
        showPage(1);
    } else if (event.state.page == 2) {

        let post;

        try {
            post = await getPost(event.state.id);
        } catch (err) {
            console.error(err.message);
        }

        showPage(2, { "populate": true, "post": post });
    } else if (event.state.page == 3) {
        showPage(3);
    }
}

window.onload = async function () {

    totalPosts = parseInt(await (await fetch("/api/postcount")).text());

    let pathnameArray = window.location.pathname.split("/");
    if (pathnameArray[pathnameArray.length - 1] == "") {
        pathnameArray.pop();
    }

    let pathnamePage = pathnameArray[1];

    if (pathnamePage == "post") {
        let postId = pathnameArray[2];
        let post;

        try {
            post = await getPost(postId);
        } catch (err) {
            console.error(err.message);
            showPage(4, { "message": err.message });
        }

        if (post) {
            showPage(2, { populate: true, history: true, "post": { id: postId, title: post.title, content: post.content, created_at: post.created_at, modified_at: post.modified_at } });
        }
    } else if (pathnamePage == "edit") {

        let params = new URLSearchParams(document.location.search);

        if (params.get("post")) {

            let post;

            try {
                post = await getPost(params.get("post"));
            } catch (err) {
                console.error(err.message);
                showPage(4, { "message": err.message });
            }

            if (post) {
                showPage(3, { "history": true, "post": post });
            }
        } else {
            showPage(3, { history: true });
        }
    } else {
        showPage(1, { history: true, populate: true });
    }

    populateHeader();

    populateSidebar();
};
