const toggle = document.getElementById('toggleDark');
const toggle2 = document.getElementById('toggleDark2');
const body = document.querySelector('body');
const bloglist = document.querySelector('.bloglist a');
const backbtn = document.querySelector(".toblog a");
const cards = document.querySelectorAll('.card');
const tagIcon = document.querySelectorAll('.tag-icon');


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
  }

  if (backbtn) {
    backbtn.style.color = 'black';
    backbtn.style.transition = '1s';
  }

  if (bloglist) {
    bloglist.style.color = 'black';
    bloglist.style.transition = '1s';
  }


  if (tagIcon) {
    document.querySelectorAll('.tag-icon').forEach((tag) => { tag.style.fill = '#000' });
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

  }
  if (backbtn) {
    backbtn.style.color = 'white';
    backbtn.style.transition = '1s';
  }
  if (bloglist) {
    bloglist.style.color = 'white';
    bloglist.style.transition = '1s';
  }

  if (tagIcon) {
    document.querySelectorAll('.tag-icon').forEach((tag) => { tag.style.fill = '#fff' });
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



async function getAllPosts(type) {
  const blog = await axios.get('https://nijikade-backend.vercel.app/api/post?type=' + type);
  const years = blog.data.posts;
  const postsDiv = document.querySelector('#posts');
  postsDiv.innerHTML = '';
  years.forEach(year => {
    postsDiv.innerHTML += `<h5>${year.year}</h5>`;
    year.posts.forEach(post => {
      postsDiv.innerHTML += `<a class="btna" href="./post.html?id=${post.id}">${post.title}</a>

            <p class="post-info"><span class="date">${post.date}</span><svg class="tag-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: rgba(0, 0, 0, 1);transform: ;msFilter:;"><path d="M17.868 4.504A1 1 0 0 0 17 4H3a1 1 0 0 0-.868 1.496L5.849 12l-3.717 6.504A1 1 0 0 0 3 20h14a1 1 0 0 0 .868-.504l4-7a.998.998 0 0 0 0-.992l-4-7zM16.42 18H4.724l3.145-5.504a.998.998 0 0 0 0-.992L4.724 6H16.42l3.429 6-3.429 6z"></path></svg><span class="tags">${post.tags || 'No tags'}</span></p>
      <br>`;
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

  const postData = await axios.get('https://nijikade-backend.vercel.app/api/post/' + id);
  const post = postData.data;
  const title = document.querySelector('#title');
  const content = document.querySelector('#post-content');

  title.innerHTML = post.data.title;
  content.innerHTML = post.data.content;
}

let slideIndex = 1;
showSlides(slideIndex);

// Next/previous controls
function plusSlides(n) {
  showSlides(slideIndex += n);
}

// Thumbnail image controls
function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("mySlides");
  let dots = document.getElementsByClassName("dot");
  if (n > slides.length) { slideIndex = 1 }
  if (n < 1) { slideIndex = slides.length }
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex - 1].style.display = "block";
  dots[slideIndex - 1].className += " active";
}

/* ASSIGNMENT 1 */

function updateConversionFields() {
  const conversionType = document.getElementById('conversionType').value;
  const input = document.getElementById('inputValue');
  
  if (conversionType === "CtoF") {
    input.placeholder = "Enter Celsius";
  } else if (conversionType === "FtoC") {
    input.placeholder = "Enter Fahrenheit";
  } else if (conversionType === "MtoF") {
    input.placeholder = "Enter Meters";
  } else if (conversionType === "FtoM") {
    input.placeholder = "Enter Feet";
  }
  
  document.getElementById('result').innerText = "";
}

function Conversion() {
  const conversionType = document.getElementById('conversionType').value;
  const inputValue = parseFloat(document.getElementById('inputValue').value);
  let resultText = "";

  if (conversionType === "CtoF") {
    const fahrenheit = (inputValue * 9 / 5) + 32;
    resultText = `Fahrenheit: ${fahrenheit.toFixed(2)}°F`;
  } else if (conversionType === "FtoC") {
    const celsius = (inputValue - 32) * 5 / 9;
    resultText = `Celsius: ${celsius.toFixed(2)}°C`;
  } else if (conversionType === "MtoF") {
    const feet = inputValue * 3.28084;
    resultText = `Feet: ${feet.toFixed(2)} ft`;
  } else if (conversionType === "FtoM") {
    const meters = inputValue / 3.28084;
    resultText = `Meters: ${meters.toFixed(2)} m`;
  }

  document.getElementById('result').innerText = resultText;
}

updateConversionFields();

/* ASSIGNMENT 2 */

function calculateTax() {

let ti, basictax, totaltax;

  ti = document.getElementById("taxableincome").value * 1;

  if (ti <= 250000) {
      basictax = 0;
  } else if (ti > 250000 && ti <= 400000) {
      totaltax = (ti-250000) * 0.20;
  } else if (ti > 400000 && ti <= 800000) {
      totaltax = 30000 + ((ti-400000) * 0.25);
  } else if (ti > 800000 && ti <= 2000000) {
      totaltax = 130000 + ((ti-800000) * 0.30);
  } else if (ti > 2000000 && ti <= 8000000) {
      totaltax = 490000 + ((ti-2000000) * 0.32);
  } else {
      totaltax = 2410000 + ((ti-8000000) * 0.35);
  }

  totaltax = totaltax.toFixed(2);
  document.getElementById("incometax").value = totaltax; 
}

/* ASSIGNMENT 3 */

function numberCalculator() {

  const n = parseInt(document.getElementById("numberInput").value);
  const operation = document.getElementById("operation").value;
  let resultText = "";

  if (isNaN(n) || n <= 0) {
    resultText = "Please enter a valid positive number.";
  } else {
    switch (operation) {
      case "factorial":
        resultText = `Factorial of ${n}: ${factorial(n)}`;
        break;
      case "sum":
        resultText = `Sum of first ${n} natural numbers: ${sumOfFirstN(n)}`;
        break;
      case "average":
        resultText = `Average of first ${n} natural numbers: ${averageOfFirstN(n).toFixed(2)}`;
        break;
    }
  }
  
  document.getElementById("result").textContent = resultText;
}

function factorial(n) {
  let factorial = 1;
  for (let i = 1; i <= n; i++) {
    factorial *= i;
  }
  return factorial;
}

function sumOfFirstN(n) {
  return (n * (n + 1)) / 2;
}

function averageOfFirstN(n) {
  return sumOfFirstN(n) / n;
}

/* ASSIGNMENT 4 */

function addToTable() {

  const employeeName = document.getElementById("employeeName").value;
  const daysWorked = parseFloat(document.getElementById("daysWorked").value);
  const dailyRate = parseFloat(document.getElementById("dailyRate").value);
  const deductionAmount = parseFloat(document.getElementById("deductionAmount").value);

  if (!employeeName || !daysWorked || !dailyRate || !deductionAmount) {
    alert("Please fill in all fields.");
    return;
  }

  const grossPay = daysWorked * dailyRate;
  const netPay = grossPay - deductionAmount;

  const tableBody = document.getElementById("itemstable").querySelector("tbody");
  const newRow = document.createElement("tr");
  newRow.innerHTML = `
      <td>${employeeNumber}</td>
      <td>${employeeName}</td>
      <td>${daysWorked}</td>
      <td>${dailyRate}</td>
      <td>${grossPay.toFixed(2)}</td>
      <td>${deductionAmount}</td>
      <td>${netPay.toFixed(2)}</td>
  `;

  tableBody.appendChild(newRow);

  document.getElementById("employeeName").value = "";
  document.getElementById("daysWorked").value = "";
  document.getElementById("dailyRate").value = "";
  document.getElementById("deductionAmount").value = "";
  
}
