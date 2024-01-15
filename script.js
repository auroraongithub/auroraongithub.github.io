const toggle = document.getElementById('toggleDark');
const toggle2 = document.getElementById('toggleDark2');
const body = document.querySelector('body');
const bloglist = document.querySelector('.bloglist a');
const backbtn = document.querySelector(".toblog a");
const cards = document.querySelectorAll('.card');
const blogs = document.querySelectorAll('.bloglist a');


toggle.addEventListener('click', function () {
  this.classList.toggle('bi-moon');
  if (this.classList.toggle('bi-brightness-high-fill')) {
    changeTheme('dark');
    setDarkTheme();
  } else {
    changeTheme('light');
    setLightTheme();
  }
});

var toggleButton = document.getElementById("toggleDark");
toggleButton.addEventListener("click", function () {
  document.body.classList.toggle("light-mode");
  bloglist.classList.toggle("light-mode");

});

toggle2.addEventListener('click', function () {
  this.classList.toggle('bi-moon');
  if (this.classList.toggle('bi-brightness-high-fill')) {
    changeTheme('dark');
    setDarkTheme();
  } else {
    changeTheme('light');
    setLightTheme();
  }
});

var toggleButton = document.getElementById("toggleDark2");
toggleButton.addEventListener("click", function () {
  document.body.classList.toggle("light-mode");
  if (bloglist) {
    bloglist.classList.toggle("light-mode");
  }
});

// function to save theme to localstorage
const changeTheme = theme => localStorage.setItem('theme', theme);

// function for getting theme from localstorage
const getTheme = theme => {
  return localStorage.getItem('theme');
};


// function for setting light theme
const setLightTheme = () => {
  if (body) {
    body.style.background = 'white';
    body.style.color = 'black';
    body.style.transition = '1s';
  }

  if (cards) {
    cards.forEach((card) => card.style.color = 'black');
    cards.forEach((card) => card.style.border = 'black');
  }

  if (backbtn) {
    backbtn.style.color = 'black';
    backbtn.style.transition = '1s';
  }

  if (bloglist) {
    bloglist.style.color = 'black';
    bloglist.style.transition = '1s';
  }
  if (blogs) {
    blogs.forEach((blogs) => blogs.style.color = 'black');
  }
}

const setDarkTheme = () => {
  if (body) {
    body.style.background = '#0a0a0a';
    body.style.color = 'white';
    body.style.transition = '1s';
  }
  if (cards) {
    cards.forEach((card) => card.style.color = 'white');
    cards.forEach((card) => card.style.border = 'white');
  }
  if (backbtn) {
    backbtn.style.color = 'white';
    backbtn.style.transition = '1s';
  }
  if (bloglist) {
    blogs.style.color = 'white';
    bloglist.style.transition = '1s';
  }
  if (blogs) {
    blogs.forEach((bloglist) => bloglist.style.color = 'white');
  }
}


const theme = getTheme();
if (theme == 'dark') {
  setDarkTheme();
} else {
  toggle.classList.toggle('bi-moon');
  toggle2.classList.toggle('bi-moon');
  toggle.classList.toggle('bi-brightness-high-fill')
  toggle2.classList.toggle('bi-brightness-high-fill')
  setLightTheme();
}



async function getBlogs() {
  const blog = await axios.get('https://nijika-api.vercel.app/api/blog');
  const years = blog.data.posts;
  const postsDiv = document.querySelector('#posts');
  postsDiv.innerHTML = '';
  years.forEach(year => {
    postsDiv.innerHTML += `<h5>${year.year}</h5>`;
    year.posts.forEach(post => {
      postsDiv.innerHTML += `<a class="btna" href="./post.html?id=${post.id}">${post.title}</a><p>${post.date}</p><br>`;
    });
    postsDiv.innerHTML += '<br>'
  });
}


async function getPost() {
  const url = new URL(window.location.href);
  const id = url.searchParams.get('id');

  if (!id) {
    window.location.href = './blogs.html';
  }

  const postData = await axios.get('https://nijika-api.vercel.app/api/blog/' + id);
  const post = postData.data;
  const title = document.querySelector('#title');
  const content = document.querySelector('#post-content');

  title.innerHTML = post.data.title;
  content.innerHTML = post.data.content;
}