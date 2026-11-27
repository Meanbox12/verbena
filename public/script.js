const postPage = document.getElementById("post-page");
const listPage = document.getElementById("list-page");
const editPage = document.getElementById("edit-page");
const searchPage = document.getElementById("search-page");
const errorPage = document.getElementById("error-page");
const sidebar = document.getElementById("sidebar-post-container");

const imageViewer = document.getElementById("image-viewer");
const imageViewerImage = document.getElementById("image-viewer-image");
const imageViewerAlt = document.getElementById("image-viewer-alt");

const headerLogo = document.getElementById("header-logo");
const headerLogoLink = document.getElementById("header-logo-link");
const headerTitle = document.getElementById("header-title");
const headerSubtitle = document.getElementById("header-subtitle");
const headerSearchbarLabel = document.getElementById("header-searchbar-label");
const headerSearchbar = document.getElementById("header-searchbar");
const headerSearchbarButton = document.getElementById("header-searchbar-button");
const headerSearchbarAdvanced = document.getElementById("header-searchbar-advanced");

const postPageReturn = document.getElementById("post-page-return");
const postPageTitle = document.getElementById("post-page-title");
const postPageContent = document.getElementById("post-page-content");
const postPageCreated = document.getElementById("post-page-created");
const postPageModified = document.getElementById("post-page-modified");
const postPageId = document.getElementById("post-page-id");
const postPageRaw = document.getElementById("post-page-raw");
const postPageEdit = document.getElementById("post-page-edit");
const postPageDelete = document.getElementById("post-page-delete");

const editPageInputs = document.getElementById("edit-page-inputs");
const editPageInputsOpen = document.getElementById("edit-page-inputs-open");
const editPageTitle = document.getElementById("edit-page-title");
const editPageReturn = document.getElementById("edit-page-return");
const editPagePostReturn = document.getElementById("edit-page-post-return");
const editPageIdInput = document.getElementById("edit-page-id-input");
const editPageLoad = document.getElementById("edit-page-load");
const editPageTitleInput = document.getElementById("edit-page-title-input");
const editPageContentInput = document.getElementById("edit-page-content-input");
const editPageSave = document.getElementById("edit-page-save");
const editPageNotice = document.getElementById("edit-page-notice");

const editPagePreview = document.getElementById("edit-page-preview");
const editPagePreviewOpen = document.getElementById("edit-page-preview-open");
const editPagePreviewTitle = document.getElementById("edit-page-preview-title");
const editPagePreviewContainer = document.getElementById("edit-page-preview-container");

const editPageUpload = document.getElementById("edit-page-upload");
const editPageUploadOpen = document.getElementById("edit-page-upload-open");
const editPageUploadInput = document.getElementById("edit-page-upload-input");
const editPageUploadSave = document.getElementById("edit-page-upload-save");
const editPageUploadResponse = document.getElementById("edit-page-upload-response");
const editPageUploadCode = document.getElementById("edit-page-upload-code");
const editPageUploadPreview = document.getElementById("edit-page-upload-preview");
const editPageUploadAlt = document.getElementById("edit-page-upload-alt");
const editPageEmpty = document.getElementById("edit-page-empty");

const searchPageReturn = document.getElementById("search-page-return");

const errorPageText = document.getElementById("error-page-text");
const errorPageReturn = document.getElementById("error-page-return");

let postViewId = "";
let currentPost;
let postViewType = 1;
let stateNum = 0;

let previousScroll = 0;

let faithfulMarkdown = false;
let listPagePopulated = false;

// Functions

/**
 * Parses a markdown string using the Marked library.
 * @param {string} markdown
 * @returns {string} The parsed string as HTML.
 */
function parseMarkdown(markdown) {
    if (faithfulMarkdown) {
        return marked.parse(markdown);
    } else {
        // Faithful markdown follows the markdown syntax exactly, but turning it off makes newlines work properly
        let editedMarkdown = markdown.replaceAll("\n", "  \n");
        return marked.parse(editedMarkdown);
    }
}

/**
 * Populates the Image Viewer with an image Element's information.
 * @param {Element} image
 */
function showImageViewer(image) {
    imageViewer.style.display = "flex";
    imageViewerImage.setAttribute("src", image.src);
    imageViewerImage.setAttribute("alt", image.alt);
    imageViewerImage.setAttribute("title", image.alt);
    if (image.alt) {
        imageViewerAlt.innerText = image.alt;
    } else {
        imageViewerAlt.innerText = "[ No Title ]";
    }
}

/**
 * Hides all pages in the content area.
 */
function hideAllPages() {
    listPage.style.display = "none";
    postPage.style.display = "none";
    editPage.style.display = "none";
    searchPage.style.display = "none";
    errorPage.style.display = "none";
}

/**
 * Populates the Post page with a post.
 * @param {number} id
 * @param {string} title
 * @param {string} content
 * @param {number} created_at
 * @param {number} modified_at
 */
function populatePostPage(id, title, content, created_at, modified_at) {
    postPageTitle.innerText = title;
    postPageContent.innerHTML = parseMarkdown(content);
    let creationDate = new Date(Math.round(created_at)).toLocaleString();
    let modifiedDate = new Date(Math.round(modified_at)).toLocaleString();
    postPageCreated.innerText = "Created on " + (creationDate == "Invalid Date" ? created_at : creationDate);
    postPageModified.innerText = "Last modified on " + (modifiedDate == "Invalid Date" ? modified_at : modifiedDate);
    postPageId.innerText = id;
    postViewId = id;

    let images = postPageContent.getElementsByTagName("img");

    for (let i of images) {
        i.addEventListener("click", function () {
            showImageViewer(i);
        });

        i.style.cursor = "pointer";
    }
}

/**
 * Populates the Edit page with a post.
 * @param {string} id
 * @param {string} title
 * @param {string} content
 */
function populateEditPage(id, title, content) {
    editPageIdInput.value = id;
    editPageTitleInput.value = title;
    editPageContentInput.value = content;
    if (id != "sidebar") {
        editPagePostReturn.innerText = "Post " + id;
        editPagePostReturn.style.display = "inline-block";
    } else {
        editPagePostReturn.style.display = "none";
    }
    postViewId = id;
}

/**
 * Creates a Element for a post (to be added to the List page).
 * @param {number} id
 * @param {string} title
 * @param {string} content
 * @param {number} created_at
 * @param {number} modified_at
 * @returns {Element}
 */
function createPostElement(id, title, content, created_at, modified_at) {
    let postElement = document.createElement("div");
    postElement.className = "post"
    postElement.id = "post-" + id;

    let postElementTitle = document.createElement("a");
    postElementTitle.className = "large-text";
    postElementTitle.innerText = title;
    postElementTitle.tabIndex = 0;
    postElementTitle.href = "/post/" + id;
    postElement.appendChild(postElementTitle);

    let postElementContent = document.createElement("p");
    postElementContent.className = "post-markdown-container";
    postElementContent.innerHTML = parseMarkdown(content);
    postElement.appendChild(postElementContent);

    let postElementCreated = document.createElement("small");
    postElementCreated.className = "small-text";
    let creationDate = new Date(Math.round(created_at)).toLocaleString();
    postElementCreated.innerText = "Created on " + (creationDate == "Invalid Date" ? created_at : creationDate);
    postElement.appendChild(postElementCreated);

    postElement.appendChild(document.createElement("br"));

    let postElementModified = document.createElement("small");
    postElementModified.className = "small-text";
    let modifiedDate = new Date(Math.round(modified_at)).toLocaleString();
    postElementModified.innerText = "Last modified on " + (modifiedDate == "Invalid Date" ? modified_at : modifiedDate);
    postElement.appendChild(postElementModified);


    postElementTitle.addEventListener("click", async function (event) {
        // Stop the link from actually redirecting
        event.preventDefault();

        await loadPage(2, { "populate": true, "history": true, "post": { id: id, title: title, content: content, created_at: created_at, modified_at: modified_at } });
    });


    return postElement;
}

/**
 * Populates the List page with post elements.
 * @param {JSON} posts A JSON objects containing the posts to be shown.
 */
function populateListPage(posts) {

    listPage.innerHTML = "";

    for (let i = posts.length - 1; i >= 0; i--) {
        let postObject = posts[i];
        let postElement = createPostElement(postObject.id, postObject.title, postObject.content, postObject.created_at, postObject.modified_at);
        listPage.appendChild(postElement);
        listPage.appendChild(document.createElement("hr"));
    }

    let images = listPage.getElementsByTagName("img");

    for (let i of images) {
        i.addEventListener("click", function () {
            showImageViewer(i);
        });

        i.style.cursor = "pointer";
    }
}

/**
 * Attempts to call showPage(). Will call showError() if an error is thrown.
 * @param  {...any} args Arguments to be passed to showPage().
 */
async function loadPage(...args) {
    try {
        await showPage(...args);
    } catch (err) {
        showError(err);
    }
}

// TODO: Redo this to handle the new ways posts can be populated
/**
 * Shows the List page.
 */
function showListPage(data) {
    hideAllPages();
    if (data?.populate || !listPagePopulated) {
        populateListPage(data.posts);
        listPagePopulated = true;
    }

    listPage.style.display = "block";

    if (previousScroll != 0) {
        window.scroll(0, previousScroll);
        previousScroll = 0;
    }

    if (data?.history) {
        pushHistoryState("/", 1);
    }
}

/**
 * Shows the Post page.
 */
function showPostPage(data) {
    previousScroll = scrollY;

    hideAllPages();
    if (data?.populate) {
        populatePostPage(data.post.id, data.post.title, data.post.content, data.post.created_at, data.post.modified_at);
        currentPost = data.post;
    }

    postViewType = 1;
    postPageRaw.innerText = "View Raw";

    postPage.style.display = "block";
    window.scroll(0, 0);

    if (data?.history) {
        pushHistoryState("/post" + (data?.post?.id ? "/" + data.post.id : ""), 2, { "populate": true, "post": data.post });
    }
}

/**
 * Shows the Edit page.
 */
function showEditPage(data) {
    hideAllPages();
    editPage.style.display = "block";

    if (data?.post) {
        if (data.sidebar) {
            populateEditPage("sidebar", "Sidebar", data.post.content);
            data.post.id = "sidebar";
        } else {
            populateEditPage(data.post.id, data.post.title, data.post.content);
        }
    }

    if (editPageTitleInput.value != "") {
        editPagePreviewTitle.innerText = editPageTitleInput.value;
    }

    if (editPageContentInput.value != "") {
        editPagePreviewContainer.innerHTML = parseMarkdown(editPageContentInput.value);
    }

    if (data?.history) {
        pushHistoryState("/edit" + (data?.post?.id ? "?post=" + data.post.id : ""), 3, { "post": data.post });
    }
}

/**
 * Shows the Search page.
 */
function showSearchPage(data) {
    hideAllPages();

    searchPage.style.display = "block";

    if (data?.history) {
        pushHistoryState("/search", 4);
    }
}

/**
 * Shows the Error page.
 */
function showErrorPage(data) {
    hideAllPages();

    if (data?.message) {
        errorPageText.innerText = data.message;
    }

    errorPage.style.display = "block";
}

// TODO: Remove this, and replace instances of showPage() with their respective mini-function (??)
/**
 * Shows a page in the content area of the site.
 * @param {Number} page The page to be shown. 0 = Error, 1 = List, 2 = Post, 3 = Edit, 4 = Search
 * @param {JSON} data A JSON object containing additional data about how the page should be shown.
 */
async function showPage(page, data) {

    // List Page

    if (page == 1) {
        if (!data?.posts) {
            data.posts = await (await fetch("/api/posts")).json();
        }
        showListPage(data);
    }

    // Post Page
    else if (page == 2) {
        showPostPage(data);
    }

    // Edit Page
    else if (page == 3) {
        showEditPage(data);
    }

    // Search Page
    else if (page == 4) {
        showSearchPage(data);
    }

    // Error Page
    else if (page == 0) {
        showErrorPage(data);
    }
}

/**
 * Shows an error to the user in the console and in the content area.
 */
function showError(err) {
    console.error(err);
    void showPage(0, { "message": err.message });
}

/**
 * Pushes a new state to the window history.
 * @param {string} url The URL that should be displayed.
 * @param {number} page The page that should be displayed in the content area when this state is popped.
 * @param {JSON} data Extra data for page display when this state is popped.
 */
function pushHistoryState(url, page, data) {
    window.history.pushState({ "page": page, "data": data }, "", url);
}

/**
 * Fetches a post's info as JSON from the server.
 * @param {string} id
 * @returns {JSON}
 */
async function getPost(id) {
    let postRaw;

    if (id == "sidebar") {
        postRaw = await fetch("/api/info/4");
    } else {
        postRaw = await fetch("/api/post/" + id);
    }

    let type = postRaw.headers.get("content-type");

    if (type.includes("application/json")) {
        let post = await postRaw.json();
        return post;
    } else {
        throw new Error(await postRaw.text());
    }

}

/**
 * Gets the current post count from the server.
 * @returns {number}
 */
async function getPostCount() {
    return Number.parseInt(await (await fetch("/api/postcount")).text());
}

/**
 * Populates the site's header.
 */
async function populateHeader() {

    let info = await (await fetch("/api/info")).json();

    let title = info[0].content;
    let subtitle = info[1].content;
    let logo = info[2].content;

    headerLogo.src = logo;
    headerLogo.setAttribute("alt", title + " Logo");
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

    sidebar.innerHTML = parseMarkdown(sidebarPost.content);
}

/**
 * Toggles the visibility of a modal on the Edit page.
 * @param {number} modal The modal to be toggled. 1 = Editor, 2 = Preview, 3 = Files
 */
function toggleEditPageModal(modal) {
    let pageElement;

    switch (modal) {
        case 1:
            pageElement = editPageInputs;
            break;
        case 2:
            pageElement = editPagePreview;
            break;
        case 3:
            pageElement = editPageUpload;
            break;
    }

    if (pageElement.style.display == "none") {
        pageElement.style.display = "block";
    } else {
        pageElement.style.display = "none";
    }

    if (editPageInputs.style.display == "none" && editPagePreview.style.display == "none" && editPageUpload.style.display == "none") {
        editPageEmpty.style.display = "block";
    } else {
        editPageEmpty.style.display = "none";
    }
}

/**
 * Uploads a file to the server.
 * @param {File} file 
 * @returns The server's response.
 */
async function uploadFile(file) {
    let response = await fetch("/api/upload", {
        method: "POST",
        body: file
    });

    return response;
}

/**
 * Searches for posts which contain a string in their title.
 * @param {string} title 
 * @returns {JSON} A JSON object containing all posts that fit the search criteria.
 */
async function searchTitle(title) {

    let response = await fetch("/api/search/" + title);

    if (response.status == 200) {

        let body = await response.json();

        if (body == "") {
            return "";
        } else {
            return body;
        }

    } else {
        throw new Error("Search Error: " + response.status + " - " + await response.text());
    }
}

/**
 * Populates the List page using a title search.
 */
async function populateSearch() {
    if (headerSearchbar.value && headerSearchbar.value != "") {

        let searchObject = await searchTitle(headerSearchbar.value);

        if (searchObject != "") {
            await loadPage(1, { "populate": true, "history": true, "posts": await searchTitle(headerSearchbar.value) });
        } else {
            listPage.innerHTML = "<p class='large-text page-title'>No posts were found for your search.</p>"
        }
    } else {
        await loadPage(1, { "populate": true, "history": true });
    }
}

// Event Listeners

headerSearchbar.addEventListener("keydown", async function (event) {
    if (event.code === "Enter") {
        await populateSearch();
    }
});

headerSearchbarButton.addEventListener("click", async function () {
    await populateSearch();
});

headerSearchbarAdvanced.addEventListener("click", async function () {
    await loadPage(4, { "history": true });
});

postPageReturn.addEventListener("click", async function () {
    await loadPage(1, { "history": true });
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
        void showPage(0, { message: err.message });
        return;
    }

    await loadPage(3, { "history": true, "post": { "id": postViewId, "title": post.title, "content": post.content } });
});

editPageLoad.addEventListener("click", async function () {
    if (editPageIdInput.value != "") {
        try {
            await loadPage(3, { "history": true, "post": await getPost(editPageIdInput.value.toLowerCase()), "sidebar": (editPageIdInput.value.toLowerCase() == "sidebar") });
        } catch (err) {
            console.error(err.message);
            editPageIdInput.value = "";
        }
    }
});

editPageTitleInput.addEventListener("input", function () {
    let value = editPageTitleInput.value;
    if (value == "") {
        editPagePreviewTitle.innerText = "Post Preview";
    } else {
        editPagePreviewTitle.innerText = editPageTitleInput.value;
    }
});

editPageContentInput.addEventListener("input", function () {
    let value = editPageContentInput.value;
    if (value == "") {
        editPagePreviewContainer.innerText = "Type something...";
    } else {
        editPagePreviewContainer.innerHTML = parseMarkdown(editPageContentInput.value);
    }
});

editPageUploadAlt.addEventListener("input", function () {
    let imgCodeList = editPageUploadCode.innerText.split("\"");
    editPageUploadCode.innerText = `<img src="${imgCodeList[1]}" alt="${editPageUploadAlt.value}">`;
});

postPageDelete.addEventListener("click", async function () {

    let confirmation = confirm("Are you sure you want to delete the post? This action cannot be undone.");

    if (!confirmation) {
        return;
    }

    let response = await fetch("/api/delete/" + postViewId, {
        method: "DELETE"
    });

    if (response) {

        let responseText = await response.text();

        if (responseText != "false") {
            window.location.href = "/";
        } else {
            alert("An error occured when deleting the post.");
        }
    } else {
        alert("An error occured when deleting the post.");
    }
});

editPageReturn.addEventListener("click", async function () {
    await loadPage(1, { "history": true });
});

editPagePostReturn.addEventListener("click", async function () {
    await loadPage(2, { "populate": true, "history": true, "post": await getPost(postViewId) });
});

editPageInputsOpen.addEventListener("click", function () {
    toggleEditPageModal(1);
});

editPagePreviewOpen.addEventListener("click", function () {
    toggleEditPageModal(2);
})

editPageUploadOpen.addEventListener("click", function () {
    toggleEditPageModal(3);
});

editPageUploadSave.addEventListener("click", async function () {

    if (!editPageUploadInput.files[0]) {
        return;
    }

    let formData = new FormData();
    formData.append("file", editPageUploadInput.files[0]);

    let response = await uploadFile(formData);

    if (response.status == 201) {
        let resText = await response.text();
        let imageCode = `<img src="${resText}" alt="${editPageUploadAlt.value}">`;

        editPageUploadResponse.innerText = "Uploaded the file.";
        editPageUploadCode.innerText = imageCode;
        editPageUploadPreview.setAttribute("src", resText);
        editPageUploadPreview.style.display = "block";

    } else if (response.status == 200) {
        let resText = await response.text();
        let imageCode = `<img src="${resText}" alt="${editPageUploadAlt.value}">`;

        editPageUploadResponse.innerText = "File is already on the server.";
        editPageUploadCode.innerText = imageCode;
        editPageUploadPreview.setAttribute("src", resText);
        editPageUploadPreview.style.display = "block";

    } else if (response.status == 400 || response.status == 500) {
        editPageUploadCode.innerText = "An error occured when uploading the file.\n" + await response.text();
    } else {
        editPageUploadCode.innerText = "An unknown error occurred. Please try again later.";
    }
});

editPageSave.addEventListener("click", async function () {

    editPagePreviewContainer.innerHTML = parseMarkdown(editPageContentInput.value);

    let response;

    if (editPageIdInput.value != "") {
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

        if (response.status == 200 || response.status == 201) {
            if (editPageIdInput.value == "sidebar") {
                window.location.href = "/";
            } else {
                window.location.href = "/post/" + responseText;
            }
        } else {
            editPageNotice.innerText = "An error occured when creating the post.\n" + responseText;
        }
    } else {
        editPageNotice.innerText = "An unknown error occured when creating the post.";
    }
});

searchPageReturn.addEventListener("click", async function () {
    await loadPage(1, { "history": true });
});

errorPageReturn.addEventListener("click", async function () {
    await loadPage(1, { "history": true });
});

imageViewer.addEventListener("click", function () {
    imageViewer.style.display = "none";
});

imageViewerAlt.addEventListener("click", function (event) {
    event.stopPropagation();
});

imageViewerImage.addEventListener("click", function (event) {
    event.stopPropagation();
});

window.onpopstate = async function (event) {

    if (!event.state) {
        return;
    }

    if (event.state.page == 1) {
        await loadPage(1);
    } else if (event.state.page == 2) {
        if (event.state.data) {
            await loadPage(2, { "populate": true, "post": event.state.data.post });
        }
    } else if (event.state.page == 3) {
        if (event.state.data) {
            await loadPage(3, { "post": event.state.data.post });
        }
    } else if (event.state.page == 4) {
        await loadPage(4);
    }
}

window.onload = async function () {

    populateHeader().catch((err) => {
        showError(err);
    });

    populateSidebar().catch((err) => {
        showError(err);
    });

    let pathnameArray = window.location.pathname.split("/");
    if (pathnameArray.at(-1) == "") {
        pathnameArray.pop();
    }

    if (pathnameArray == "") {
        return await loadPage(1, { "populate": true, "history": true });
    }

    let pathnamePage = pathnameArray[1].toLowerCase();

    if (pathnamePage == "post") {
        try {
            await loadPage(2, { "populate": true, "history": true, "post": await getPost(pathnameArray[2]) });
        } catch (err) {
            showError(err);
        }
    } else if (pathnamePage == "edit") {

        let params = new URLSearchParams(document.location.search);

        if (params.get("post")) {

            try {
                await loadPage(3, { "history": true, "post": await getPost(params.get("post")) });
            } catch (err) {
                showError(err);
            }
        } else {
            await loadPage(3, { "history": true });
        }
    } else if (pathnamePage == "search") {
        await loadPage(4, { "history": true });
    }
};
