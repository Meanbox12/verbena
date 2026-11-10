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
    console.log(`Post element with title ${title}, content ${content}, info ${info}`);

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
        contentPage.style.display = "none";
        postPage.style.display = "block";

        postPageTitle.innerText = postElementTitle.innerText;
        // Don't need to fix this bug because this isn't how the frontend is really going to work lol
        postPageContent.innerText = postElementContent.innerText;
        postPageInfo.innerText = postElementInfo.innerText;
        postPageNumber.innerText = "#" + id;

        // TODO: Save the scroll position on the site to return the user to where they were if they click Return
        window.scroll(0, 0);    
    });

    return postElement;
}

async function populatePosts(page) {
    let postsRaw = await fetch("/api/posts");
    let posts = await postsRaw.json();

    for (let i = posts.length - 1; i >= 0; i--) {
        let postObject = posts[i];
        let postElement = createPostElement(postObject.id, postObject.title, postObject.content, postObject.created_at);
        console.log(postElement);
        contentPage.appendChild(postElement);
    }
}

window.onload = async function () {
    populatePosts();
};
