const login = async function (email, password) {
  try {
    const res = await axios({
      method: 'post',
      url: 'http://127.0.0.1:3000/api/v1/users/login',
      data: {
        email,
        password,
      },
    });
    alert('You are logged in!');
    window.setTimeout(() => {
      location.assign('/');
    }, 1500);
  } catch (err) {
    alert(err.response.data.message);
  }
};

document.querySelector('.form')?.addEventListener('submit', function (event) {
  event.preventDefault();
  const email = document.querySelector('#email').value;
  const password = document.querySelector('#password').value;
  login(email, password);
});
