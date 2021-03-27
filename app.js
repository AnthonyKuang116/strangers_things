const BASE_URL = "https://strangers-things.herokuapp.com";
const cohort = "2101-VPI-RM-WEB-PT";

$(".main_body").append($(".results"))

async function fetchPosts() {
  const url = `${BASE_URL}/api/${cohort}/posts`;
  
  return fetch(url)
  .then(response => response.json())
  .then(result => {
    renderResults(result.data.posts)
    // console.log(result.data);
    return result;
  })
  .catch(console.error);
}
fetchPosts()

function renderResults(result){
  $(".results").empty();
  console.log(result)
  result.forEach(function (render){
    $(".results").append(renderPosts(render))
    // console.log(render)
  })
}


function renderPosts(post){
  const newPost = $('<div class=newPost></div>')
  const postTitle = $(`<h3><span class="postTitle"><b style="font-size: 40px">${post.title}</b></span></h3>`)
  const postPrice = $(`<h4><span class="postPrice"><b style="font-size: 20px">Price: </b>${post.price}</span></h4>`)
  const postDesc = $(`<h4><span class="postDesc"><b style="font-size: 20px">Description: </b> ${post.description}</span></h4>`)
  const postLoc = $(`<h4><span class="postLoc"><b>Location: </b style="font-size: 20px"> ${post.location}</span></h4>`)
  newPost.append(postTitle, postPrice, postDesc, postLoc)
  if(post.willDeliver === true){
    const postDeliver = $(`<h4><span class="postDeliver">Will Deliver!</span></h4>`)
    newPost.append(postDeliver)
  }
  else if(post.willDeliver === false){
    const postDeliver = $(`<h4><span class="postDeliver">Will Not Deliver.</span></h4>`)
    newPost.append(postDeliver)
  }

  //add message button later....

  newPost.data("post",post);
  return newPost
}


$(".create_posts").click(function(event){
  event.preventDefault();
  $('.results').empty();

  const newPost = $('<div class="myPost"></div>')
  const userPost = 
    `<form id="userPost">
        <label>Title:</label>
        <textarea class="userTitle"></textarea>
        <label>Price:</label>
        <textarea class="userPrice"></textarea>
        <label>Product Description:</label>
        <textarea class="userDesc"></textarea>
        <label>Location:</label>
        <textarea class="userLoc"></textarea>
    </form>`
  $('.results').append(newPost)
  newPost.append(userPost)
})

//click function for logins and signups
$(".login_signup").click(function (event) {
  event.preventDefault();
  const bgBlur = $(`<div></div>`);
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
  const form = 
    `<form id="form">
        <label class="userName" for="userName">User Name</label>
        <input class="userNameInput" id="userNameInput" type="text" placeholder=" username"/>
        <label class="password" for="password">Password</label>
        <input class="userPassInput" id="userPassInput" type="text" placeholder=" password"/>
        <input class="CreateButton" type="submit" value="Create">
        <input class="loginButton" type="submit" value="Log In">
    </form>`
  createAccount.append(form)


  $(".createButton").on("click", function (event) {
    event.preventDefault();
    const url = `${BASE_URL}/api/${cohort}/users/register`;
    const username = $(".userNameInput").val();
    const password = $(".userPassInput").val();
    console.log(url)
    console.log(username, password)
    fetch(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: {
            username: `${username}`,
            password: `${password}`,
          },
        }),
      }
    )
      .then((response) => {
        console.log(response)
        return response.json()})
      .then((result) => {
        console.log(result);
        
      })
      .catch(console.error);
  });

//   $(".loginButton").on("click", function (event) {
//     event.preventDefault();
//     const url = `${BASE_URL}/${cohort}/users/login`;
//     const username = $(".userNameInput").val();
//     const password = $(".userPassInput").val();

//     return fetch(
//       url,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           user: {
//             username: `${username}`,
//             password: `${password}`,
//           },
//         }),
//       }
//     )
//       .then((response) => response.json())
//       .then((result) => {
//         console.log(result);
//         return result;
//       })
//       .catch(console.error);
//   });
});


