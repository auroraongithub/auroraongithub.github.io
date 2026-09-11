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
            const response = await axios.post('https://nijikade-backend.vercel.app/api/login', { email, password });
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
const typeInput = document.querySelector('#category');
const tagsInput = document.querySelector('#tags');


if (addBlogForm) {
    addBlogForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const title = titleInput.value;
        const tags = tagsInput.value;
        const content = quill.root.innerHTML;
        console.log(tags)


        const type = typeInput.value;
        const token = localStorage.getItem('jwt');

        if (!token) {
            Swal.fire({
                title: "You are not logged in",
                icon: "error"
            });
            return;
        }

        if (title === '' || quill.root.innerText === '' || tags === '') {
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

        const data = {
            title,
            type,
            content,
            tags
        };
        console.log(data);

        try {
            const response = await axios.post(`https://nijikade-backend.vercel.app/api/post?token=${token}`, data);
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
        const tags = tagsInput.value;
        const content = quill.root.innerHTML;
        const token = localStorage.getItem('jwt');

        if (!token) {
            Swal.fire({
                title: "You are not logged in",
                icon: "error"
            });
            return;
        }

        if (title === '' || quill.root.innerText === '' || tags === '') {
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
            const response = await axios.patch(`https://nijikade-backend.vercel.app/api/post/${id}?token=${token}`, { title, content, tags });
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
    const blog = await axios.get('https://nijikade-backend.vercel.app/api/post?type=' + type);
    const years = blog.data.posts;
    const postsDiv = document.querySelector('#posts');
    postsDiv.innerHTML = '';
    years.forEach(year => {
        postsDiv.innerHTML += `<h5>${year.year}</h5>`;
        year.posts.forEach(post => {
            postsDiv.innerHTML += `<div class="blog-item"><a class="btna" href="./post.html?id=${post.id}">${post.title}</a>
            <a class="edit-btn" href = "./update-post.html?id=${post.id}" > <i class="fa fa-edit"></i></a>&nbsp;
            <a class="delete-btn" onclick="deletePost('${post.id}')" > <i class="fas fa-trash"></i></a> <br>
            <p class="post-info"><span class="date">${post.date}</span><svg class="tag-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: rgba(0, 0, 0, 1);transform: ;msFilter:;"><path d="M17.868 4.504A1 1 0 0 0 17 4H3a1 1 0 0 0-.868 1.496L5.849 12l-3.717 6.504A1 1 0 0 0 3 20h14a1 1 0 0 0 .868-.504l4-7a.998.998 0 0 0 0-.992l-4-7zM16.42 18H4.724l3.145-5.504a.998.998 0 0 0 0-.992L4.724 6H16.42l3.429 6-3.429 6z"></path></svg><span class="tags">${post.tags || 'No tags'}</span></p></div><br>`;
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

    const postData = await axios.get('https://nijikade-backend.vercel.app/api/post/' + id);
    const post = postData.data;

    titleInput.value = post.data.title;
    tagsInput.value = post.data.tags;
    quill.clipboard.dangerouslyPasteHTML(post.data.content);
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
            axios.delete(`https://nijikade-backend.vercel.app/api/post/${id}?token=${token}`)
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
