const loginForm = document.querySelector('#loginForm');
const emailInput = document.querySelector('#email');
const passwordInput = document.querySelector('#password');

if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = emailInput.value;
        const password = passwordInput.value;

        if (email === '' || password === '') {
            Swal.fire({
                title: "Fill all the fields",
                icon: "error"
            });
            return;
        }

        Swal.fire({
            title: 'Please wait',
            allowOutsideClick: false,
            showConfirmButton: false,
            onBeforeOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const response = await axios.post('http://localhost:3000/api/login', { email, password });
            localStorage.setItem('jwt', response.data.token)
            Swal.close();
            Swal.fire({
                title: 'Logged in successfully',
                icon: "success"
            });
            window.location.href = "/admin/blogs.html";

        } catch (error) {
            let errorMessage = 'An error occurred';

            if (error.response && error.response.data && error.response.data.error) {
                errorMessage = error.response.data.error;
            }

            Swal.fire({
                title: errorMessage,
                icon: "error"
            });
        }
    });
}

const addBlogForm = document.querySelector('#addBlogForm');
const titleInput = document.querySelector('#title');
const contentInput = document.querySelector('#content');
const typeInput = document.querySelector('#category');


if (addBlogForm) {
    addBlogForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const title = titleInput.value;
        const content = contentInput.value;
        const type = typeInput.value;
        const token = localStorage.getItem('jwt');

        if (!token) {
            Swal.fire({
                title: "You are not logged in",
                icon: "error"
            });
            return;
        }

        if (title === '' || content === '') {
            Swal.fire({
                title: "Fill all the fields",
                icon: "error"
            });
            return;
        }

        if (type === '') {
            Swal.fire({
                title: "Select category",
                icon: "error"
            });
            return;
        }

        Swal.fire({
            title: 'Please wait',
            allowOutsideClick: false,
            showConfirmButton: false,
            onBeforeOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const response = await axios.post(`http://localhost:3000/api/post?token=${token}`, { title, type, content });
            localStorage.setItem('jwt', response.data.token)
            Swal.close();
            Swal.fire({
                title: 'Post added successfully',
                icon: "success"
            });

        } catch (error) {

            let errorMessage = 'An error occurred';

            if (error.response && error.response.data && error.response.data.error) {
                errorMessage = error.response.data.error;

                if (error.response.status === 401) {
                    window.location.href = './login.html';
                    return;
                }
            }

            Swal.fire({
                title: errorMessage,
                icon: "error"
            });
        }

    });
}

const updateBlogForm = document.querySelector('#updateBlogForm');

if (updateBlogForm) {
    updateBlogForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const title = titleInput.value;
        const content = contentInput.value;
        const token = localStorage.getItem('jwt');

        if (!token) {
            Swal.fire({
                title: "You are not logged in",
                icon: "error"
            });
            return;
        }

        if (title === '' || content === '') {
            Swal.fire({
                title: "Fill all the fields",
                icon: "error"
            });
            return;
        }

        Swal.fire({
            title: 'Please wait',
            allowOutsideClick: false,
            showConfirmButton: false,
            onBeforeOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const url = new URL(window.location.href);
            const id = url.searchParams.get('id');

            if (!id) {
                window.location.href = './blogs.html';
            }
            const response = await axios.patch(`http://localhost:3000/api/post/${id}?token=${token}`, { title, content });
            localStorage.setItem('jwt', response.data.token)
            Swal.close();
            Swal.fire({
                title: 'Post updated successfully',
                icon: "success"
            });

        } catch (error) {
            let errorMessage = 'An error occurred';

            if (error.response && error.response.data && error.response.data.error) {
                errorMessage = error.response.data.error;

                if (error.response.status === 401) {
                    window.location.href = './login.html';
                    return;
                }
            }

            Swal.fire({
                title: errorMessage,
                icon: "error"
            });
        }

    });
}


const getPostsAdmin = async (type) => {
    const blog = await axios.get('http://localhost:3000/api/post?type=' + type);
    const years = blog.data.posts;
    const postsDiv = document.querySelector('#posts');
    postsDiv.innerHTML = '';
    years.forEach(year => {
        postsDiv.innerHTML += `<h5>${year.year}</h5>`;
        year.posts.forEach(post => {
            postsDiv.innerHTML += `<div class="blog-item"><a class="btna" href="./post.html?id=${post.id}">${post.title}</a>
            <a class="edit-btn" href = "./update-post.html?id=${post.id}" > <i class="fa fa-edit"></i></a>&nbsp;
            <a class="delete-btn" onclick="deletePost('${post.id}')" > <i class="fas fa-trash"></i></a> <br><p>${post.date}</p></div><br>`;
        });
        postsDiv.innerHTML += '<br>'
    });
}

const getPostData = async () => {
    const url = new URL(window.location.href);
    const id = url.searchParams.get('id');

    if (!id) {
        window.location.href = './blogs.html';
    }

    const postData = await axios.get('http://localhost:3000/api/post/' + id);
    const post = postData.data;
    const title = document.querySelector('#title');
    const content = document.querySelector('#post-content');

    titleInput.value = post.data.title;
    contentInput.value = post.data.content;
}

const deletePost = (id) => {
    const token = localStorage.getItem('jwt');

    if (!token) {
        Swal.fire({
            title: "You are not logged in",
            icon: "error"
        });
        return;
    }

    Swal.fire({
        title: 'Are you sure?',
        text: 'You won\'t be able to revert this!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        reverseButtons: true,
    }).then((result) => {
        if (result.isConfirmed) {
            axios.delete(`http://localhost:3000/api/post/${id}?token=${token}`)
                .then((response) => {
                    Swal.fire({
                        title: 'Post deleted successfully',
                        icon: "success"
                    });
                    window.location.href = './blogs.html';
                })
                .catch((error) => {
                    let errorMessage = 'An error occurred';

                    if (error.response && error.response.data && error.response.data.error) {
                        errorMessage = error.response.data.error;

                        if (error.response.status === 401) {
                            window.location.href = './login.html';
                            return;
                        }
                    }

                    Swal.fire({
                        title: errorMessage,
                        icon: "error"
                    });
                });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
        }
    });
};
