const { ipcRenderer } = require("electron");

ipcRenderer.on("console", async (event, message) => {
    let code = document.getElementById("code");
    code.innerText += message
});
