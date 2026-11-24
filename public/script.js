const postPage = document.getElementById("post-page");
const listPage = document.getElementById("list-page");
const editPage = document.getElementById("edit-page");
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

const editPageEmpty = document.getElementById("edit-page-empty");

const errorPageText = document.getElementById("error-page-text");
const errorPageReturn = document.getElementById("error-page-return");

let postViewId = "";
let currentPost;
// TODO: Update this variable more often
let totalPosts = 0;
let postViewType = 1;

let previousScroll = 0;

let faithfulMarkdown = false;
let listPagePopulated = false;

// Functions

/**
 * Parses a markdown string using the Marked library.
 * @param {String} markdown The string to be parsed.
 * @returns The parsed string as HTML.
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

function showImageViewer(image) {
    imageViewer.style.display = "flex";
    imageViewerImage.setAttribute("src", image.src);
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
            postElementTitle.href = "/post/" + id;
            postElement.appendChild(postElementTitle);

            let postElementContent = document.createElement("p");
            postElementContent.className = "post-markdown-container";
            postElementContent.innerHTML = parseMarkdown(content);
            postElement.appendChild(postElementContent);

            // TODO: Add the image viewer

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


            postElementTitle.addEventListener("click", function (event) {
                // Stop the link from actually redirecting
                event.preventDefault();
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
        
        let images = listPage.getElementsByTagName("img");

        for (let i = 0; i < images.length; i++) {
            images[i].addEventListener("click", function() {
                showImageViewer(images[i]);
            });

            images[i].style.cursor = "pointer";
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
        postPageId.innerText = id;
        postViewId = id;
    }

    function populateEditPage(id, title, content) {
        editPageIdInput.value = id;
        editPageTitleInput.value = title;
        editPageContentInput.value = content;
    }

    // List Page
    if (page == 1) {
        hideAllPages();
        if (data && data.populate || !listPagePopulated) {
            await populateListPage();
            listPagePopulated = true;
        }

        listPage.style.display = "block";

        if (previousScroll != 0) {
            window.scroll(0, previousScroll);
            previousScroll = 0;
        }

        if (data && data.history) {
            let object = { "page": 1 }
            window.history.pushState(object, "", "/");
        }
    }

    // Post Page
    else if (page == 2) {

        console.log(scrollY);
        previousScroll = scrollY;

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
    // TODO: Find a better way of determining whether the post is the sidebar
    else if (page == 3) {
        hideAllPages();
        editPage.style.display = "block";

        console.log(data.post);

        if (data && data.post) {
            if (!data.post.title) {
                populateEditPage("sidebar", "Sidebar", data.post.content);
            } else {
                populateEditPage(data.post.id, data.post.title, data.post.content);
            }
        }

        // TODO: Call this somewhere else
        if (editPageTitleInput.value != "") {
            editPagePreviewTitle.innerText = editPageTitleInput.value;
        }

        if (editPageContentInput.value != "") {
            editPagePreviewContainer.innerHTML = parseMarkdown(editPageContentInput.value);
        }

        if (data && data.history) {
            let object = { "page": 3 }
            window.history.pushState(object, "", "/edit" + (data.post ? "?post=" + (data.post.title ? data.post.id : "sidebar") : ""));
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

/**
 * Fetches a post's info from the server using a post ID.
 * @param {String} id The post ID to be fetched.
 * @returns {JSON} A JSON object in the following format: {id: [Post Id], title: [Post Title], content: [Post Content], created_at: [Post Creation Info]}
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
 * @returns {Number} The number of posts.
 */
async function getPostCount() {
    return parseInt(await (await fetch("/api/postcount")).text());
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

// Event Listeners

postPageReturn.addEventListener("click", function () {
    showPage(1, { history: true, populate: !listPagePopulated });
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

// TODO: Make this return button go back to the post page if the Edit button was clicked
editPageReturn.addEventListener("click", function () {
    showPage(1, { history: true, populate: !listPagePopulated });
});

editPageLoad.addEventListener("click", async function () {
    if (editPageIdInput.value != "") {
        try {
            showPage(3, { populate: true, history: false, post: await getPost(editPageIdInput.value) });
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

errorPageReturn.addEventListener("click", function () {
    showPage(1, { history: true, populate: !listPagePopulated });
});

postPageDelete.addEventListener("click", async function () {

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
            window.location.href = "/";
        } else {
            alert("An error occured when deleting the post.");
        }
    } else {
        alert("An error occured when deleting the post.");
    }
});

function toggleEditPageModal(page) {

    let pageElement;

    switch (page) {
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

editPageInputsOpen.addEventListener("click", function () {
    toggleEditPageModal(1);
});

editPagePreviewOpen.addEventListener("click", function () {
    toggleEditPageModal(2);
})

editPageUploadOpen.addEventListener("click", function () {
    toggleEditPageModal(3);
});

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

    console.log(response);

    return response;
}

editPageUploadSave.addEventListener("click", async function () {

    if (!editPageUploadInput.files[0]) {
        return;
    }

    let formData = new FormData();
    formData.append("file", editPageUploadInput.files[0]);

    let response = await uploadFile(formData);

    if (response.status == 201) {
        let resText = await response.text();
        let imageCode = `<img src="${resText}">`;

        editPageUploadResponse.innerText = "Uploaded the file.";
        editPageUploadCode.innerText = imageCode;
        editPageUploadPreview.setAttribute("src", resText);
        editPageUploadPreview.style.display = "block";

    } else if (response.status == 200) {
        let resText = await response.text();
        let imageCode = `<img src="${resText}">`;

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

imageViewer.addEventListener("click", function() {
    imageViewer.style.display = "none";
});

imageViewerAlt.addEventListener("click", function(event) {
    event.stopPropagation();
});

imageViewerImage.addEventListener("click", function(event) {
    event.stopPropagation();
    window.open(imageViewerImage.getAttribute("src"), "_blank");
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
