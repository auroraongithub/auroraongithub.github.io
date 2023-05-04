const toggle = document.getElementById('toggleDark');
const toggle2 = document.getElementById('toggleDark2');
const body = document.querySelector('body');
const bloglist = document.querySelector('.bloglist a');
const backbtn = document.querySelector(".toblog a");



toggle.addEventListener('click', function () {
  this.classList.toggle('bi-moon');
  if (this.classList.toggle('bi-brightness-high-fill')) {

    body.style.background = '#0a0a0a';
    body.style.color = 'white';
    body.style.transition = '1s';
    backbtn.style.color = 'white';
    backbtn.style.transition = '1s';
    bloglist.style.color = 'white';
    bloglist.style.transition = '1s';

  } else {

    body.style.background = 'white';
    body.style.color = 'black';
    body.style.transition = '1s';
    backbtn.style.color = 'black';
    backbtn.style.transition = '1s';
    bloglist.style.color = 'black';
    bloglist.style.transition = '1s';
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

    body.style.background = '#0a0a0a';
    body.style.color = 'white';
    body.style.transition = '1s';
    backbtn.style.color = 'white';
    backbtn.style.transition = '1s';
    bloglist.style.color = 'white';
    bloglist.style.transition = '1s';

  } else {

    body.style.background = 'white';
    body.style.color = 'black';
    body.style.transition = '1s';
    backbtn.style.color = 'black';
    backbtn.style.transition = '1s';
    bloglist.style.color = 'black';
    bloglist.style.transition = '1s';

  }

});

var toggleButton = document.getElementById("toggleDark2");
toggleButton.addEventListener("click", function () {
  document.body.classList.toggle("light-mode");
  bloglist.classList.toggle("light-mode");

});
