const toggle = document.getElementById('toggleDark');
const toggle2 = document.getElementById('toggleDark2');
const body = document.querySelector('body');
const bloglist = document.querySelector('.bloglist a');
const backbtn = document.querySelector(".toblog a");


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
  bloglist.classList.toggle("light-mode");
});

// function to save theme to localstorage
const changeTheme = theme => localStorage.setItem('theme', theme);

// function for getting theme from localstorage
const getTheme = theme => {
  return localStorage.getItem('theme');
};


// function for setting light theme
const setLightTheme = () => {
  body.style.background = 'white';
  body.style.color = 'black';
  body.style.transition = '1s';
  bloglist.style.color = 'black';
  bloglist.style.transition = '1s';
  backbtn.style.color = 'black';
  backbtn.style.transition = '1s';

}

const setDarkTheme = () => {
  body.style.background = '#0a0a0a';
  body.style.color = 'white';
  body.style.transition = '1s';
  bloglist.style.color = 'white';
  bloglist.style.transition = '1s';

  backbtn.style.color = 'white';
  backbtn.style.transition = '1s';
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
  const blog = await axios.get('https://nijikade-backend.vercel.app/api/blog');
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

  const postData = await axios.get('https://nijikade-backend.vercel.app/api/blog/' + id);
  const post = postData.data;
  const title = document.querySelector('#title');
  const content = document.querySelector('#post-content');

  title.innerHTML = post.data.title;
  content.innerHTML = post.data.content;
}
