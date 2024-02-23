//-------------------------- FETCH --------------------- //
//fetch data with network error control
function fetchData(link) {
    return fetch(link)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response failed');
            }
            //promise based
            return response.json();
        })
        .catch(error => {
            console.error('Error getting the link:', error);
            throw error;
        });
}

//fetch posts
function fetchPosts() {
    return fetchData('https://dummyjson.com/posts')
        .then(data => {
            //console.log(data);
            return data.posts || [];
        })
        .catch(error => {
            console.error('Error getting the data:', error);
            return [];
        });
}

//fetch users
function fetchUsers() {
    return fetchData('https://dummyjson.com/users')
        .then(data => {
            //console.log(data);
            return data.users || [];
        })
        .catch(error => {
            console.error('Error getting the data:', error);
            return [];
        });
}

//fetch comments
function fetchComments() {
    return fetchData('https://dummyjson.com/comments')
        .then(data => {
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
    //load the first 5 scrolls
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

    //event listener for when close button is clicked
    document.getElementById('close-popup').addEventListener('click', () => {
        popupBox.style.display = 'none';
    });
}

//--------------------------------------- SCROLLING & PAGINATION -------------------------------//

let page = 1;
const postsPerPage = 5;

//seperate posts, 5 by 5 and once they are loaded, get the next 5 pages
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

//creating everything inside of the post container (post, comment and tag)
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
    console.log(user);
    console.log(post);
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
    //this match is right - no need to consider
    const postComments = comments.filter(comment => post.id === comment.postId);
    console.log(postComments); 
    
    if (postComments.length) {
    
        const commentsContainer = document.createElement('div');
        commentsContainer.classList.add('comments-container');

        const commentsHeader = document.createElement('p');
        commentsHeader.textContent = 'Comments:';
        commentsContainer.appendChild(commentsHeader);

        //go through the comments
        postComments.forEach(comment => {
            const commentElement = document.createElement('p');

            //find the user compared with the comment
            const commentUser = users.find(user => comment.user.id === user.id);

            if (commentUser) {
                //add profile pic of commenter
                const commentImg = document.createElement('img');
                commentImg.src = commentUser.image;
                commentImg.width = 20;
                commentImg.classList.add('profile-icon');

                //username link for commenter
                const commentUsername = document.createElement('span');
                commentUsername.textContent = commentUser.username || '';
                commentUsername.style.cursor = 'pointer';

                commentUsername.onclick = () => showUserDetails(commentUser);

                //appedning
                commentElement.appendChild(commentImg);
                commentElement.appendChild(commentUsername);
                commentsContainer.appendChild(commentElement);
            } else {
                //eerror handling if not found
                commentElement.textContent = 'Unknown Commenter';
                commentsContainer.appendChild(commentElement);
            }
            //adding the actual comment
                const commentBody = document.createElement('span');
                commentBody.textContent = `: ${comment.body}`;
                commentElement.appendChild(commentBody);
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
