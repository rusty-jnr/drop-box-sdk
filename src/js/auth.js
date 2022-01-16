import { Dropbox } from "dropbox";

var CLIENT_ID = "xwndbqapj3saatm";

const dbx = new Dropbox({
  clientId: CLIENT_ID,
});

function getAccessTokenFromUrl() {
  return utils.parseQueryString(window.location.hash).access_token;
}

function isAuthenticated() {
  return !!getAccessTokenFromUrl();
}

if (isAuthenticated()) {
  var dbx = new Dropbox({ accessToken: getAccessTokenFromUrl() });
  dbx
    .filesListFolder({ path: "" })
    .then(function (response) {
      renderItems(response.result.entries);
    })
    .catch(function (error) {
      console.error(error);
    });
} else {
  var dbx = new Dropbox({ clientId: CLIENT_ID });
  var authUrl = dbx.auth
    .getAuthenticationUrl("http://localhost:8080/auth")
    .then((authUrl) => {
      console.log(authUrl);
      //   document.getElementById("authlink").href = authUrl;
    });
}
