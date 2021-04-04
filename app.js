const BASE_URL = "https://strangers-things.herokuapp.com";
const cohort = "2101-VPI-RM-WEB-PT";

//Posts, messages, and creating posts all renders in ".results"
$(".main_body").append($(".results"));

//Keeps track of current user if there is one
window.auth_state = {
  currentUser: localStorage.getItem("currentUser"),
  authError: null,
};

//If current user is saved in local storage, welcomes user
function userLoggedIn() {
  if (window.auth_state.currentUser != null) {
    const hello = $(
      `<div class="hello">Hello, ${window.auth_state.currentUser}!</div>`
    );
    const logout = $(`<div class="logout">Logout?</div>`);
    $(".login_signup").remove();
    $("#app").append(hello, logout);
    userLogout();
  }
}
userLoggedIn();

//fetches all posts
async function fetchPosts() {
  const url = `${BASE_URL}/api/${cohort}/posts`;
  const token = localStorage.getItem("token");
  return fetch(
    url,
    token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : {}
  )
    .then((response) => response.json())
    .then((result) => {
      renderResults(result.data.posts);
      return result;
    })
    .catch(console.error);
}
fetchPosts();

//Used to filter posts by keywords and appends the posts to page
function renderResults(result) {
  $(".results").empty();
  let searchInput = $(".searchInput").val();
  let searchInputLower = searchInput.toLowerCase();
  if (searchInput === "") {
    result.forEach(function (render) {
      $(".results").append(renderPosts(render));
    });
  } else {
    result
      .filter(function ({ title, description }) {
        if (title.toLowerCase().includes(searchInputLower)) {
          return true;
        } else if (description.toLowerCase().includes(searchInputLower)) {
          return true;
        }
        return false;
      })
      .forEach(function (render) {
        $(".results").append(renderPosts(render));
      });
  }
}

//renders post
function renderPosts(post) {
  const {
    title,
    price,
    description,
    location,
    author: { username },
    willDeliver,
    isAuthor,
  } = post;
  const newPost = $("<div class=newPost></div>");
  const postTitle = $(
    `<h3><span class="postTitle"><b style="font-size: 35px; color:blue">${title}</b></span></h3>`
  );
  const postPrice = $(
    `<h4><span class="postPrice"><b style="font-size: 20px; color:rgb(3, 78, 252)">Price: </b>${price}</span></h4>`
  );
  const postDesc = $(
    `<h4><span class="postDesc"><b style="font-size: 20px; color:rgb(3, 78, 252)">Description: </b> ${description}</span></h4>`
  );
  const postLoc = $(
    `<h4><span class="postLoc"><b style="font-size: 20px; color:rgb(3, 78, 252)">Location: </b> ${location}</span></h4>`
  );
  const postAuthor = $(
    `<h4><span class="postAuthor"><b style="font-size: 20px; color:rgb(3, 78, 252)">Author: </b>${username}</span></h4>`
  );

  newPost.append(postTitle, postPrice, postDesc, postLoc, postAuthor);
  if (willDeliver === true) {
    const postDeliver = $(
      `<h4><span class="postDeliver" style="color:green">Will Deliver!</span></h4>`
    );
    newPost.append(postDeliver);
  } else if (willDeliver === false) {
    const postDeliver = $(
      `<h4><span class="postDeliver" style="color:rgb(184, 28, 0)">Will Not Deliver.</span></h4>`
    );
    newPost.append(postDeliver);
  }

  //Delete post button for author's post
  function deleteBtn() {
    const element = $(this).closest(".newPost");
    const myPost = element.data("post");
    deletePost(myPost);
  }
  //Edit post button for author's post
  function editBtn() {
    const element = $(this).closest(".newPost");
    const myPost = element.data("post");
    editPost(myPost);
  }
  //Send message button for a post that does not belong to owner
  function messageBtn() {
    const element = $(this).closest(".newPost");
    const message = element.data("post");
    const bgBlur = $(`<div class="bgBlur"></div>`);
    bgBlur.css({
      width: "100%",
      height: "100%",
      position: "absolute",
      top: "0",
      left: "0",
      "z-index": "100",
      "backdrop-filter": "blur(6px)",
    });
    $("#app").append(bgBlur);

    const createMsg = $('<div class="createMsg"></div>');
    createMsg.css({
      width: "400px",
      height: "200px",
      "z-index": "101",
      position: "absolute",
      "background-color": "white",
      top: "40%",
      left: "40%",
    });
    bgBlur.append(createMsg);

    const newMsg = `<div id="newMsg">
        <textarea class="msgContent"></textarea>
        <input class="sendMsgBtn" type="submit" value="Send Message">
      </div>`;
    createMsg.append(newMsg);
    $(".sendMsgBtn").on("click", function (event) {
      event.preventDefault();
      console.log("test")
      sendMessage(message);
      bgBlur.remove();
    });
  }
  if (window.auth_state.currentUser != null) {
    if (isAuthor) {
      const edit_delete = $(`<div class="edit_delete"></div>`);
      const postEditBtn = $(
        `<button class="editPost" type="button">Edit Post</button>`
      );
      const postDeleteBtn = $(
        `<button class="isAuthorBtn" type="button">Delete Post</button>`
      );
      postDeleteBtn.click(deleteBtn);
      postEditBtn.click(editBtn);
      newPost.append(edit_delete);
      edit_delete.append(postEditBtn, postDeleteBtn);
    } else {
      const messageBtnDiv = $('<div class="messageBtnDiv"></div>');
      const sendMsg = $(
        `<button class="notAuthorBtn" type="button">Send Message</button>`
      );
      sendMsg.click(messageBtn);

      newPost.append(messageBtnDiv);
      messageBtnDiv.append(sendMsg);
    }
  }

  newPost.data("post", post);
  return newPost;
}

//Sends message
async function sendMessage({_id}) {
  const message_ID = _id;
  const url = `${BASE_URL}/api/${cohort}/posts/${message_ID}/messages`;
  const token = localStorage.getItem("token");
  const newMessage = $(".msgContent").val();

  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      message: {
        content: `${newMessage}`,
      },
    }),
  })
    .then((response) => response.json())
    .catch(console.error);
}

//Edits user post
async function editPost({ _id, title, price, description, location }) {
  const post_ID = _id;
  const url = `${BASE_URL}/api/${cohort}/posts/${post_ID}`;
  const token = localStorage.getItem("token");

  $(".results").empty();
  const newPost = $('<div class="myPost"></div>');
  const userPost = $(`<form id="userPost">
        <label class="postTitle">Title:</label>
        <textarea class="userTitle">${title}</textarea>
        <label>Price:</label>
        <textarea class="userPrice">${price}</textarea>
        <label>Product Description:</label>
        <textarea class="userDesc">${description}</textarea>
        <label>Location (If left blank, location will be on request):</label>
        <textarea class="userLoc">${location}</textarea>
        <label class="willNotDeliver"> I Will Not Deliver.
          <input class="willNotDeliverButton" type="radio" checked="checked" name="radio">
        </label>
        <label class="willDeliver">I Will Deliver!
          <input class="willDeliverButton" type="radio" name="radio">
        </label>
        <input class="createPostBtn" type="submit" value="Create Post">
    </form>`);
  $(".results").append(newPost);
  newPost.append(userPost);

  userPost.submit(function (event) {
    event.preventDefault();
    const title = $(".userTitle").val();
    const description = $(".userDesc").val();
    const price = $(".userPrice").val();
    const location =
      $(".userLoc").val() != "" ? $(".userLoc").val() : "[On Request]";
    const willDeliver = $(".willDeliverButton").is(":checked") ? true : false;

    return fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        post: {
          title,
          description,
          price,
          location,
          willDeliver,
        },
      }),
    })
      .then((response) => response.json())
      .then(() => {
        fetchPosts();
      })
      .catch(console.error);
  });
}

//Delete users post
async function deletePost({ _id }) {
  const post_ID = _id;
  const url = `${BASE_URL}/api/${cohort}/posts/${post_ID}`;
  const token = localStorage.getItem("token");
  return fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then(() => {
      fetchPosts();
    })
    .catch(console.error);
}

//Create a new post view
$(".create_posts").click(function (event) {
  event.preventDefault();
  if (
    window.auth_state.currentUser != null ||
    window.auth_state.currentUser != undefined
  ) {
    $(".results").empty();
    const newPost = $('<div class="myPost"></div>');
    const userPost = `<form id="userPost">
          <label class="postTitle">Title:</label>
          <textarea class="userTitle"></textarea>
          <label>Price:</label>
          <textarea class="userPrice"></textarea>
          <label>Product Description:</label>
          <textarea class="userDesc"></textarea>
          <label>Location (If left blank, location will be on request):</label>
          <textarea class="userLoc"></textarea>
          <label class="willNotDeliver"> I Will Not Deliver.
            <input class="willNotDeliverButton" type="radio" checked="checked" name="radio">
          </label>
          <label class="willDeliver">I Will Deliver!
            <input class="willDeliverButton" type="radio" name="radio">
          </label>
          <input class="createPostBtn" type="submit" value="Create Post">
      </form>`;
    $(".results").append(newPost);
    newPost.append(userPost);

    $(".createPostBtn").on("click", function (event) {
      event.preventDefault();
      createPost();
    });
  } else {
    $(".notUser").remove();
    const notUser = `<div class="notUser">You cannot create posts if you are not a user!</div>`;
    $(".results").prepend(notUser);
  }
});

//creates the new post by grabbing values from a new display
async function createPost() {
  const url = `${BASE_URL}/api/${cohort}/posts`;
  const token = localStorage.getItem("token");

  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      post: {
        title: $(".userTitle").val(),
        description: $(".userDesc").val(),
        price: $(".userPrice").val(),
        location:
          $(".userLoc").val() != "" ? $(".userLoc").val() : "[On Request]",
        willDeliver: $(".willDeliverButton").is(":checked") ? true : false,
      },
    }),
  })
    .then((response) => response.json())
    .then(() => {
      fetchPosts();
    })
    .catch(console.error);
}

//The login and sign up option
login_signup();
function login_signup() {
  $(".login_signup").click(function (event) {
    event.preventDefault();
    const bgBlur = $(`<div class="bgBlur"></div>`);
    bgBlur.css({
      width: "100%",
      height: "100%",
      position: "absolute",
      top: "0",
      left: "0",
      "z-index": "100",
      "backdrop-filter": "blur(6px)",
    });
    $("#app").append(bgBlur);

    const createAccount = $('<div class="createAccount"></div>');
    createAccount.css({
      width: "400px",
      height: "200px",
      "z-index": "101",
      position: "absolute",
      "background-color": "white",
      top: "40%",
      left: "40%",
    });
    bgBlur.append(createAccount);
    const form = `<form id="form">
          <label class="userName" for="userName">User Name</label>
          <input class="userNameInput" id="userNameInput" type="text" placeholder=" username"/>
          <label class="password" for="password">Password</label>
          <input class="userPassInput" id="userPassInput" type="text" placeholder=" password"/>
          <input class="CreateButton" type="submit" value="Create">
          <input class="loginButton" type="submit" value="Log In">
      </form>`;
    createAccount.append(form);
    userCreate();
    userLogin();
    userLogout();
  });
}

//When a user wants to create an account
function userCreate() {
  $(".createButton").on("click", function (event) {
    event.preventDefault();
    const url = `${BASE_URL}/api/${cohort}/users/register`;
    const username = $(".userNameInput").val();
    const password = $(".userPassInput").val();
    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: {
          username,
          password,
        },
      }),
    })
      .then((response) => {
        return response.json();
      })
      .then((result) => {
        if (result.error) {
          window.auth_state.authError = result.error.message;
          $("#form").append(
            `<div style="color:red; padding-left:5px" >Username taken. Please choose another name.</div>`
          );
          return;
        }
        localStorage.setItem("token", result.data.token);
        localStorage.setItem("currentUser", result.data.username);
        window.auth_state.currentUser = username;
        $(".bgBlur").remove();
        user();
        $(".login_signup").remove();
        const hello = $(`<div class="hello">Hello, ${username}!</div>`);
        const logout = $(`<div class="logout">Logout?</div>`);
        $("#app").append(hello, logout);
        $(".notUser").remove();
        userLogout();
        fetchPosts();
        return result;
      })
      .catch(console.error);
  });
}

//User login
function userLogin() {
  $(".loginButton").on("click", function (event) {
    event.preventDefault();
    const url = `${BASE_URL}/api/${cohort}/users/login`;
    const username = $(".userNameInput").val();
    const password = $(".userPassInput").val();

    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: {
          username,
          password,
        },
      }),
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.error) {
          window.auth_state.authError = result.error.message;
          $("#form").append(
            `<div style="color:red; padding-left:5px" >Incorrect login. Try again.</div>`
          );
          return;
        }
        localStorage.setItem("token", result.data.token);
        localStorage.setItem("currentUser", username);
        window.auth_state.currentUser = username;
        $(".bgBlur").remove();
        user();
        $(".login_signup").remove();
        const hello = $(`<div class="hello">Hello, ${username}!</div>`);
        const logout = $(`<div class="logout">Logout?</div>`);
        $("#app").append(hello, logout);
        $(".notUser").remove();
        userLogout();
        fetchPosts();

        return result;
      })
      .catch(console.error);
  });
}

//When user logs out, the token and username are removed from local storage
//User name and "welcome" are removed
function userLogout() {
  $(".logout").on("click", function (event) {
    event.preventDefault();
    $(".hello").remove();
    $(".logout").remove();
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    $("#app").append($(`<div class="login_signup">Login/Sign-Up</div>`));
    window.auth_state.currentUser = null;
    login_signup();
    fetchPosts();
  });
}

//Grabs users already relevant data
function user() {
  const token = localStorage.getItem("token");

  fetch(`${BASE_URL}/api/${cohort}/users/me`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .catch(console.error);
}

//Renders messages sent and received
function renderMessages({ post: { title }, fromUser: { username }, content }) {
  const message = `<div id="newMessage">
      <div class="msgTitle"><b>Item:</b> ${title}</div>
      <div class="msgFromBuyer"><b>From:</b> ${username}</div>
      <div><b>Message:</b></div>
      <div class="msgContent">${content}</div>
    </div>`;
  $(".results").append(message);
}

//Click function to view messages only available to logged in user
async function messages() {
  $(".messages").on("click", function (event) {
    event.preventDefault();
    if (
      window.auth_state.currentUser != null ||
      window.auth_state.currentUser != undefined
    ) {
      const token = localStorage.getItem("token");
      return fetch(`${BASE_URL}/api/${cohort}/users/me`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((result) => {
          $(".results").empty();
          const messages = result.data.messages;
          messages.forEach(function (render) {
            $(".results").append(renderMessages(render));
          });

          return result;
        })
        .catch(console.error);
    } else {
      $(".notUser").remove();
      const notUser = `<div class="notUser">You cannot view messages if you are not a user!</div>`;
      $(".results").prepend(notUser);
    }
  });
}
messages();

//Rerenders posts. Used to add/remove new buttons for user/non-user
function posts() {
  $(".posts").on("click", function (event) {
    event.preventDefault();
    $(".searchInput").val("");
    fetchPosts();
  });
}
posts();

//Click listener for searching through posts
function search() {
  $(".searchButton").on("click", function (event) {
    event.preventDefault();
    fetchPosts();
  });
}
search();
