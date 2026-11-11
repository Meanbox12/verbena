const postPage = document.getElementById("post-page");
const contentPage = document.getElementById("content-page");
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

let postViewId = 0;
let totalPosts = 0;

postPageReturn.addEventListener("click", function () {
    contentPage.style.display = "block";
    postPage.style.display = "none";

    let object = { "page": "content" }
    window.history.pushState(object, "", "/");
});

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
        showPostPage(id, title, content, info);
        let object = { "page": "post", "id": id };
        window.history.pushState(object, "", "/post/" + id);
    });

    return postElement;
}

function showPostPage(id, title, content, info) {
    postPageTitle.innerText = title;
    // Don't need to fix this bug because this isn't how the frontend is really going to work lol
    postPageContent.innerText = content;
    postPageInfo.innerText = info;
    postPageNumber.innerText = "#" + id;

    // TODO: Save the scroll position on the site to return the user to where they were if they click Return
    window.scroll(0, 0);

    contentPage.style.display = "none";
    postPage.style.display = "block";

    postViewId = parseInt(id);
}

postPagePrevious.addEventListener("click", async function () {
    if (postViewId > 1) {
        await getPost(postViewId - 1, true);
        let object = { "page": "post", "id": postViewId };
        window.history.pushState(object, "", "/post/" + postViewId);
    }
});

postPageNext.addEventListener("click", async function () {
    if (postViewId < totalPosts) {
        await getPost(postViewId + 1, true);
        let object = { "page": "post", "id": postViewId };
        window.history.pushState(object, "", "/post/" + postViewId);
    }
});

onpopstate = async function (event) {

    if (event.state == null) {
        contentPage.style.display = "block";
        postPage.style.display = "none";
    }

    if (event.state.page == "content") {
        contentPage.style.display = "block";
        postPage.style.display = "none";
    } else if (event.state.page == "post") {
        await getPost(event.state.id, true);
    }
}

async function populatePosts(page) {
    let postsRaw = await fetch("/api/posts");
    let posts = await postsRaw.json();

    for (let i = posts.length - 1; i >= 0; i--) {
        let postObject = posts[i];
        let postElement = createPostElement(postObject.id, postObject.title, postObject.content, postObject.created_at);
        contentPage.appendChild(postElement);
    }
}

// TODO: Add the state setting as another option for this
async function getPost(id, show) {
    let postRaw = await fetch("/api/post/" + id);

    let type = postRaw.headers.get("content-type");

    if (type.includes("application/json")) {

        let post = await postRaw.json();
        if (show) {
            await showPostPage(id, post.title, post.content, post.created_at);
        }
        return post;

    } else if (type.includes("text/html")) {

        if (await postRaw.text() == "Invalid post.") {
            return { "id": 404, "title": "Invalid post.", "content": "You have searched for an invalid post!", "created_at": "Test" };
        }
    }
}

async function populateHeader() {
    let headerPost = await (await fetch("/api/post/-2")).json();

    headerTitle.innerHTML = headerPost.title;
    headerSubtitle.innerHTML = headerPost.content;
    headerSearchbarLabel.innerHTML = "Search " + headerPost.title;
}

async function populateSidebar() {
    let sidebarPost = await (await fetch("/api/post/-1")).json();

    sidebar.innerHTML = sidebarPost.content;
}

window.onload = async function () {

    totalPosts = parseInt(await (await fetch("/api/postcount")).text());

    if (window.location.href.includes("/post/")) {
        let params = window.location.href.split("/");
        let postId = params[4];
        let post = await getPost(postId);

        if (post) {
            showPostPage(postId, post.title, post.content, post.created_at);
            let object = { "page": "post", "id": postId };
            window.history.pushState(object, "", "/post/" + postId);
        }
    }

    populateHeader();

    populateSidebar();

    populatePosts();
};
