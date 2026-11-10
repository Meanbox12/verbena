const postPage = document.getElementById("post-page");
const contentPage = document.getElementById("content-page");

const headerTitle = document.getElementById("header-title");
const headerSubtitle = document.getElementById("header-subtitle");

const title1 = contentPage.getElementsByClassName("post-title")[0];
const content1 = contentPage.getElementsByClassName("post-content")[0];
const info1 = contentPage.getElementsByClassName("post-info")[0];

const postPageReturn = document.getElementById("post-page-return");
const postPageTitle = postPage.getElementsByClassName("post-title")[0];
const postPageContent = postPage.getElementsByClassName("post-content")[0];
const postPageInfo = postPage.getElementsByClassName("post-info")[1];
const postPageNumber = document.getElementById("post-page-number");

postPageReturn.addEventListener("click", function () {
    contentPage.style.display = "block";
    postPage.style.display = "none";
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

async function getPost(id) {
    let postRaw = await fetch("/api/post/" + id);

    if (postRaw.type == "json") {

        let post = await postRaw.json();
        console.log(post);
        return post;

    } else if (postRaw.type == "basic") {

        let post = await postRaw.text();
        if (post = "Invalid post.") {
            console.log("You have searched for an invalid post.");
            showPostPage(404, "Invalid post.", "You have searched for an invalid post!", "Test");
        }

    }
}

window.onload = async function () {
    if (window.location.href.includes("/post/")) {
        console.log("You are on the posts page");
        let params = window.location.href.split("/");
        console.log(params[4]);
        let postId = params[4];
        let post = await getPost(postId);

        if (post) {
            showPostPage(postId, post.title, post.content, post.created_at);
        }
    }
    populatePosts();
};
