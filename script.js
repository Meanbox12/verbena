const postPage = document.getElementById("post-page");
const contentPage = document.getElementById("content-page");

const title1 = contentPage.getElementsByClassName("post-title")[0];
const content1 = contentPage.getElementsByClassName("post-content")[0];
const info1 = contentPage.getElementsByClassName("post-info")[0];

const postPageReturn = document.getElementById("post-page-return");
const postPageTitle = postPage.getElementsByClassName("post-title")[0];
const postPageContent = postPage.getElementsByClassName("post-content")[0];
const postPageInfo = postPage.getElementsByClassName("post-info")[1];

title1.addEventListener("click", function () {
    contentPage.style.display = "none";
    postPage.style.display = "block";

    postPageTitle.innerText = title1.innerText;
    // Don't need to fix this bug because this isn't how the frontend is really going to work lol
    postPageContent.innerText = content1.innerText;
    postPageInfo.innerText = info1.innerText;

    // TODO: Save the scroll position on the site to return the user to where they were if they click Return
    window.scroll(0, 0);
});

postPageReturn.addEventListener("click", function () {
    contentPage.style.display = "block";
    postPage.style.display = "none";
});