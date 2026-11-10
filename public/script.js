const postPage = document.getElementById("post-page");
const contentPage = document.getElementById("content-page");

const headerTitle = document.getElementById("header-title");
const headerSubtitle = document.getElementById("header-subtitle");

const postPageReturn = document.getElementById("post-page-return");
const postPageTitle = postPage.getElementsByClassName("post-title")[0];
const postPageContent = postPage.getElementsByClassName("post-content")[0];
const postPageInfo = postPage.getElementsByClassName("post-info")[1];
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
    postElementTitle.className = "post-title";
    postElementTitle.innerText = title;
    postElementTitle.tabIndex = 0;
    postElement.appendChild(postElementTitle);

    let postElementContent = document.createElement("p");
    postElementContent.className = "post-content";
    postElementContent.innerText = content;
    postElement.appendChild(postElementContent);

    // TODO: Add the image viewer

    let postElementInfo = document.createElement("small");
    postElementInfo.className = "post-info";
    postElementInfo.innerText = info;
    postElement.appendChild(postElementInfo);

    postElementTitle.addEventListener("click", function () {
        showPostPage(id, title, content, info);;
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

    postViewId = id;
}

postPagePrevious.addEventListener("click", async function () {
    if (postViewId > 1) {
        let post = await getPost(postViewId - 1);
        showPostPage(postViewId - 1, post.title, post.content, post.created_at);
        let object = { "page": "post", "id": postViewId };
        window.history.pushState(object, "", "/post/" + postViewId);
    }
});

postPageNext.addEventListener("click", async function () {
    if (postViewId < totalPosts) {
        let post = await getPost(postViewId + 1);
        showPostPage(postViewId + 1, post.title, post.content, post.created_at);
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
        let post = await getPost(event.state.id);
        showPostPage(event.state.id, post.title, post.content, post.created_at);
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

// TODO: Make a different version of this function that returns something that can be directly passed to showPostPage
async function getPost(id) {
    let postRaw = await fetch("/api/post/" + id);

    let type = postRaw.headers.get("content-type");

    if (type.includes("application/json")) {

        let post = await postRaw.json();
        return post;

    } else if (type.includes("text/html")) {

        if (await postRaw.text() == "Invalid post.") {
            return { "id": 404, "title": "Invalid post.", "content": "You have searched for an invalid post!", "created_at": "Test" };
        }
    }
}

window.onload = async function () {

    totalPosts = await (await fetch("api/postcount")).text();

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
    populatePosts();
};
