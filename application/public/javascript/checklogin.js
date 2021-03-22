function makeLoginButton() {
    document.getElementById('loginLogout').innerHTML = `<a href="/login" class="btn btn-outline-secondary" role="button">Login/Register</a>`
}
function makeLogoutButton() {
    document.getElementById('loginLogout').innerHTML = `<form action="/users/logout" method="POST"><input type="Submit" class="btn btn-outline-secondary" role="button" value="Logout"></form>`
}
function checkLogin() {
    const url = '/users/checkLogin';
    fetch(url)
    .then((data) => data.json())
    .then((dataAsObject) => {
        if (dataAsObject.loggedIn) {
            makeLogoutButton();
        } else {
            makeLoginButton();
        }
    })
    .catch((err) => {
        console.log(err);
        makeLoginButton();
    });
}