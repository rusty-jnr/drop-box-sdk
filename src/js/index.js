import { Dropbox } from "dropbox";
import "regenerator-runtime/runtime";
import parseQueryString from "./utils";

var CLIENT_ID = "xwndbqapj3saatm";
const access_token = localStorage.getItem("access_token");

window.addEventListener('load', () => {
  const path = window.location.pathname;
  if (access_token) {
    if (path !== '/home/') {
      window.location.replace("http://localhost:3000/home");
    }
  } else {
    if (path === '/home/') {
      window.location.replace("http://localhost:3000");
    }
  }
});

function getAccessTokenFromUrl() {
  return parseQueryString(window.location.hash).access_token;
}

function getAccessDenied() {
  return parseQueryString(window.location.hash).access_denied;
}

const access_button = document.getElementById("accessButton");
const fileListElem = document.getElementById("js-file-list");
const rootPathFrom = document.querySelector(".js-root-path__form");
const rootPathInput = document.querySelector(".js-root-path__input");
const logoutButton = document.getElementById("logout");

if (rootPathFrom) {
  rootPathFrom.addEventListener("submit", (e) => {
    e.preventDefault();
    state.rootPath =
      rootPathInput.value === "/" ? "" : rootPathInput.value.toLowerCase();
    state.files = [];
    handleLoggedInUser();
  });
}

if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    localStorage.removeItem("access_token");
    window.location.replace("http://localhost:3000");
  });
}

if (access_button) {
  access_button.addEventListener("click", () => {
    if (!!getAccessTokenFromUrl()) {
      localStorage.setItem("access_token", getAccessTokenFromUrl());
      window.location.replace("http://localhost:3000/home");
    } else {
      window.location.replace("http://localhost:3000");
    }
  });
}

const state = {
  files: [],
  rootPath: "",
};

const handleLoggedInUser = async () => {
  var dbx = new Dropbox({ accessToken: access_token });
  const res = await dbx.filesListFolder({
    path: state.rootPath,
    limit: 20,
  });
  const {
    result: { entries },
  } = res;
  updateFiles(entries);
  const files = entries.filter((entry) => entry[".tag"] === "file");
  if (files.length > 0) {
    const fileLinks = await getFilesDownloadLink(files);
    const newStateFiles = [...state.files];
    fileLinks.forEach((fileLink) => {
      let indexToUpdate = state.files.findIndex(
        (stateFile) => stateFile.name === fileLink.name
      );
      newStateFiles[indexToUpdate].downloadUrl = fileLink.downloadUrl;
    });
    updateFiles(newStateFiles);
  }
};

const getFilesDownloadLink = async (files) => {
  var dbx = new Dropbox({ accessToken: access_token });
  const fileInfo = files.map((fileData) =>
    dbx.filesDownload({ path: fileData.path_lower })
  );
  const res = await Promise.all(fileInfo);
  const formattedResponse = res.map((file) => {
    const downloadUrl = window.URL.createObjectURL(
      new Blob([file.result.fileBlob])
    );
    return { name: file.result.name, downloadUrl };
  });
  return formattedResponse;
};

function updateFiles(files) {
  state.files = [...files];
  renderFiles();
}

function renderFiles() {
  if (fileListElem) {
    fileListElem.innerHTML = state.files
      .sort((a, b) => {
        if (
          (a[".tag"] === "folder" || b[".tag"] === "folder") &&
          !(a[".tag"] === b[".tag"])
        ) {
          return a[".tag"] === "folder" ? -1 : 1;
        } else {
          return a.name < b.name ? -1 : 1;
        }
      })
      .map((file) => {
        const type = file[".tag"];
        let thumbnail;
        let download = false;
        if (type === "file") {
          thumbnail = `https://www.svgrepo.com/show/3325/file.svg`;
          if (file.downloadUrl) {
            download = true;
          }
        } else {
          thumbnail = `https://www.svgrepo.com/show/788/folder.svg`;
        }
        return `
          <li>
            <div class="sec_1" id="${
              type === "folder" ? `view_folder` : `file`
            }">
              <img src="${thumbnail}" alt="" />
              ${file.name}
            </div>
            ${
              download
                ? `<a href="${file.downloadUrl}" download="${file.name}">
                    <img src="https://www.svgrepo.com/show/2776/download.svg" alt="" /> Download
                  </a>`
                : ""
            }
          </li>
        `;
      })
      .join("");
  }
}

if (!!getAccessTokenFromUrl()) {
  document.getElementById("accessText").innerHTML = "Authorization Successful";
  document.getElementById("accessButton").innerHTML = "Login";
} else if (!!getAccessDenied()) {
  document.getElementById("accessText").innerHTML = "Access Denied";
  document.getElementById("accessButton").innerHTML = "Return to Authorization";
} else if (localStorage.getItem("access_token")) {
  handleLoggedInUser();
} else {
  var dbx = new Dropbox({ clientId: CLIENT_ID });
  dbx.auth
    .getAuthenticationUrl("http://localhost:3000/auth")
    .then((authUrl) => {
      document.getElementById("authlink").href = authUrl;
    });
}
