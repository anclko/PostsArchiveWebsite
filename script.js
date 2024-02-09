//-------------------------- FETCH --------------------- //
// Fetch data with error control using basic fetch request
function fetchData(link) {
    return fetch(link)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response failed');
            }
            return response.json();
        })
        .catch(error => {
            console.error('Error getting the data:', error);
            throw error;
        });
}

// Fetch posts
function fetchPosts() {
    return fetchData('https://dummyjson.com/posts')
        .then(data => {
            //below is iused to check if it works
            //console.log(data);
            return data.posts || [];
        })
        .catch(error => {
            console.error('Error getting the data:', error);
            return []; // Return an empty array in case of error
        });
}

// Fetch users
function fetchUsers() {
    return fetchData('https://dummyjson.com/users')
        .then(data => {
            //below is iused to check if it works
            //console.log(data);
            return data.users || [];
        })
        .catch(error => {
            console.error('Error getting the data:', error);
            return [];
        });
}

// Fetch comments
function fetchComments() {
    return fetchData('https://dummyjson.com/comments')
        .then(data => {
            //below is iused to check if it works
            //console.log(data);
            return data.comments || [];
        })
        .catch(error => {
            console.error('Error getting the data:', error);
            return [];
        });
}

// TESTING IF INFO IS BEING RETRIEVED
//fetchPosts();
//fetchUsers();
//fetchComments();

//--------------------------------------- DISPLAYING -------------------------------//

//display final post
async function displayPosts() {
    // Load the first 5 scrolls
    await load();

    //event listeners to display rest of posts with scroll back
    window.addEventListener('scroll', scroll);
}

//user details in the pop up window
function showUserDetails(user) {
    const popupBox = document.getElementById('user-popup');
    const popupContent = document.getElementById('popup-content');

    popupContent.innerHTML = `
    <h2>${user.firstName} ${user.lastName} (${user.username})</h2>
    <p><strong>Email:</strong> ${user.email}</p>
    <p><strong>Phone:</strong> ${user.phone}</p>
    <button id="close-popup">Close</button>
    `;

    popupBox.style.display = 'block';

    //event listener for when button is clicked
    document.getElementById('close-popup').addEventListener('click', () => {
        popupBox.style.display = 'none';
    });
}

//--------------------------------------- SCROLLING & PAGINATION -------------------------------//

let page = 1;
const postsPerPage = 5;

//seperate posts, 5 by 5 and then get the posts
async function load() {
    const startIndex = (page - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const [posts, users, comments] = await Promise.all([fetchPosts(), fetchUsers(), fetchComments()]);

    posts.slice(startIndex, endIndex).forEach(post => {
        createPostElement(post, users, comments);
    });

    page++;
}

//scrolling
async function scroll() {
    //when scrolling reaches bottom, load more
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
        await load();
    }
}


//--------------------------------------- CREATING POST,COMMENT & TAGS -------------------------------//

//creating post element
function createPostElement(post, users, comments) {

    //CREATING POST
    const postElement = document.createElement('div');
    postElement.classList.add('post-container');
    postElement.innerHTML = `
        <h3>${post.title}</h3>
        <p>${post.body}</p>
        <span><strong>${post.reactions}</strong> likes</span>
        `;

    const user = users.find(user => user.id === post.userId);
    const userElement = document.createElement('p');

    if (user) {
        //profile pic for user
        const profileIcon = document.createElement('img');
        profileIcon.src = user.image;
        profileIcon.width = 20;
        profileIcon.classList.add('profile-icon');

        //username link for poster
        const usernameLink = document.createElement('a');
        usernameLink.textContent = user.username;
        usernameLink.style.cursor = 'pointer';

        usernameLink.onclick = () => showUserDetails(user);

        //adding profil pic and username to paragraph
        userElement.appendChild(profileIcon);
        userElement.appendChild(usernameLink);

    } else {
        // If user is not found
        userElement.textContent = 'Unknown Poster';
    }
    postElement.appendChild(userElement);

    // CREATING COMMENTS
    const postComments = comments.filter(comment => comment.postId === post.id);

    if (postComments.length) {
        
        const commentsContainer = document.createElement('div');
        commentsContainer.classList.add('comments-container');

        //comment header
        const commentsHeader = document.createElement('p');
        commentsHeader.textContent = 'Comments:';
        commentsContainer.appendChild(commentsHeader);

        //go through comments
        postComments.forEach(comment => {
            const commentElement = document.createElement('p');


            //add profil pic of commenter
            const commentImg = document.createElement('img');
            commentImg.src = user ? user.image : '';
            commentImg.width = 20;
            commentImg.classList.add('profile-icon');

            //username link for commenter
            const commentUsername = document.createElement('span');
            commentUsername.textContent = comment.user.username|| '';
            commentUsername.style.cursor = 'pointer';

            commentUsername.onclick = () => showUserDetails(comment.user);

            //adding the comment
            const commentBody = document.createElement('span');
            commentBody.textContent = `: ${comment.body}`;

            //adding them to the paragraph
            commentElement.appendChild(commentImg);
            commentElement.appendChild(commentUsername);
            commentElement.appendChild(commentBody);
            commentsContainer.appendChild(commentElement);
        });

        postElement.appendChild(commentsContainer);
    }

    //CREATING TAGS
    const tagsElement = document.createElement('p');
    tagsElement.classList.add('post-tags');
    tagsElement.textContent = `Tags: ${post.tags.join(', ')}`;
    postElement.appendChild(tagsElement);
    
    //adding everything to the post element
    document.getElementById('posts').appendChild(postElement);
}

//run the whole thing
window.onload = displayPosts;
