const postPage = document.getElementById("post-page");
const contentPage = document.getElementById("content-page");
const editPage = document.getElementById("edit-page");
const sidebar = document.getElementById("sidebar-links-container");

const headerTitle = document.getElementById("header-title");
const headerSubtitle = document.getElementById("header-subtitle");
const headerSearchbarLabel = document.getElementById("header-searchbar-label");

const postPageReturn = document.getElementById("post-page-return");
const postPageTitle = document.getElementById("post-page-title");
const postPageContent = document.getElementById("post-page-content");
const postPageInfo = document.getElementById("post-page-info");
const postPageNumber = document.getElementById("post-page-number");
const postPagePrevious = document.getElementById("post-page-previous");
const postPageNext = document.getElementById("post-page-next");

const editPageReturn = document.getElementById("edit-page-return");
const editPageTitle = document.getElementById("edit-page-title");
const editPageContent = document.getElementById("edit-page-content");
const editPageSave = document.getElementById("edit-page-save");

let postViewId = 0;
let totalPosts = 0;

let contentPagePopulated = false;

/**
 * Shows a page in the content area of the site.
 * @param {Number} page The page to be shown. 1 = Content, 2 = Post, 3 = Edit
 * @param {JSON} data A JSON object containing additional data about how the page should be shown.
 */
async function showPage(page, data) {

    /**
     * Hides all pages in the content area.
     */
    function hideAllPages() {
        contentPage.style.display = "none";
        postPage.style.display = "none";
        editPage.style.display = "none";
    }

    /**
     * Populates the Post page with a post.
     * @param {Number} id The post's ID.
     * @param {String} title The post's title.
     * @param {String} content The post's content.
     * @param {String} info The post's info.
     */
    function populatePostPage(id, title, content, info) {
        postPageTitle.innerText = title;
        postPageContent.innerText = content;
        postPageInfo.innerText = info;
        postPageNumber.innerText = "#" + id;
        postViewId = parseInt(id);
    }

    /**
     * Populates the Content page with post elements.
     * @param {Number} page [Currently unused] The page to load posts from.
     */
    async function populateContentPage(page) {

        /**
         * Creates a Element for a post.
         * @param {Number} id The post's ID.
         * @param {String} title The post's title.
         * @param {String} content The post's content.
         * @param {String} info The post's info.
         * @returns {Element} The created HTML element.
         */
        function createPostElement(id, title, content, info) {
            let postElement = document.createElement("div");
            postElement.className = "post"
            postElement.id = "post-" + id;

            let postElementTitle = document.createElement("a");
            postElementTitle.className = "large-text";
            postElementTitle.innerText = title;
            postElementTitle.tabIndex = 0;
            postElement.appendChild(postElementTitle);

            let postElementContent = document.createElement("p");
            postElementContent.className = "normal-text";
            postElementContent.innerText = content;
            postElement.appendChild(postElementContent);

            // TODO: Add the image viewer

            let postElementInfo = document.createElement("small");
            postElementInfo.className = "small-text";
            postElementInfo.innerText = info;
            postElement.appendChild(postElementInfo);

            postElementTitle.addEventListener("click", function () {
                showPage(2, { populate: true, history: true, post: { id: id, title: title, content: content, created_at: info } });
            });

            return postElement;
        }

        
        let postsRaw = await fetch("/api/posts");
        let posts = await postsRaw.json();

        for (let i = posts.length - 1; i >= 0; i--) {
            let postObject = posts[i];
            let postElement = createPostElement(postObject.id, postObject.title, postObject.content, postObject.created_at);
            contentPage.appendChild(postElement);
        }
    }

    // Content Page
    if (page == 1) {
        hideAllPages();
        if (data && data.populate) {
            await populateContentPage();
            contentPagePopulated = true;
        }
        contentPage.style.display = "block";

        if (data && data.history) {
            let object = { "page": 1 }
            window.history.pushState(object, "", "/");
        }
    }

    // Post Page
    else if (page == 2) {
        hideAllPages();
        if (data && data.populate) {
            await populatePostPage(data.post.id, data.post.title, data.post.content, data.post.created_at);
        }

        postPage.style.display = "block";
        // TODO: Save the scroll position on the site to return the user to where they were if they go back
        window.scroll(0, 0);

        if (data.history) {
            let object = { "page": 2, "id": data.post.id };
            window.history.pushState(object, "", "/post/" + data.post.id);
        }
    }

    // Edit Page
    else if (page == 3) {
        hideAllPages();
        editPage.style.display = "block";

        if (data && data.history) {
            let object = { "page": 3 }
            window.history.pushState(object, "", "/edit");
        }
    }

}

postPageReturn.addEventListener("click", function () {
    showPage(1, { history: true, populate: !contentPagePopulated });
});

editPageReturn.addEventListener("click", function () {
    showPage(1, { history: true, populate: !contentPagePopulated });
});

postPagePrevious.addEventListener("click", async function () {
    if (postViewId > 1) {
        showPage(2, { populate: true, history: true, post: await getPost(postViewId - 1) });
    }
});

postPageNext.addEventListener("click", async function () {
    if (postViewId < totalPosts) {
        showPage(2, { populate: true, history: true, post: await getPost(postViewId + 1) });
    }
});

editPageSave.addEventListener("click", async function () {
    let response = await fetch("/api/create", {
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify({ "title": editPageTitle.value, "content": editPageContent.value }),
    });

    // TODO: Do something with the response
});

// When the browser forward and back buttons are pressed
onpopstate = async function (event) {
    if (event.state.page == 1) {
        showPage(1);
    } else if (event.state.page == 2) {
        showPage(2, { populate: true, post: await getPost(event.state.id) });
    } else if (event.state.page == 3) {
        showPage(3);
    }
}

// TODO: Add the state setting as another option for this

/**
 * Fetches a post's info from the server.
 * @param {Number} id The post ID to be fetched.
 * @returns {JSON} A JSON object in the following format: {id: [Post Id], title: [Post Title], content: [Post Content], created_at: [Post Creation Info]}
 */
async function getPost(id) {
    let postRaw = await fetch("/api/post/" + id);

    let type = postRaw.headers.get("content-type");

    if (type.includes("application/json")) {
        let post = await postRaw.json();
        return post;

        // TODO: Show an actual error message
    } else if (type.includes("text/html")) {
        if (await postRaw.text() == "Invalid post.") {
            return { "id": 404, "title": "Invalid post.", "content": "You have searched for an invalid post!", "created_at": "N/A" };
        }
    }
}

/**
 * Populates the site's header.
 */
async function populateHeader() {
    let headerPost = await (await fetch("/api/post/-2")).json();

    headerTitle.innerHTML = headerPost.title;
    headerSubtitle.innerHTML = headerPost.content;
    headerSearchbarLabel.innerHTML = "Search " + headerPost.title;
}

/**
 * Populates the site's sidebar.
 */
async function populateSidebar() {
    let sidebarPost = await (await fetch("/api/post/-1")).json();

    sidebar.innerHTML = sidebarPost.content;
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
        let post = await getPost(postId);

        if (post) {
            showPage(2, { populate: true, history: true, post: { id: postId, title: post.title, content: post.content, created_at: post.created_at } });
        }
    } else if (pathnamePage == "edit") {
        showPage(3, { history: true });
    } else {
        showPage(1, { history: true, populate: true });
    }

    populateHeader();

    populateSidebar();
};
