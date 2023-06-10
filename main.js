const {
  app,
  clipboard,
  globalShortcut,
  BrowserWindow,
  ipcMain,
} = require("electron");
const prompt = require("electron-prompt");
const discord = require("discord.js");
require("dotenv").config({ path: "./config/.env" });

let parentMessageId = "";
let conversationId = "";
let registered = false;
let pendingRequest = false;
let mainWindow;
let api;
let webhookClient;
let promptTitles = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 1000,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadFile("./html/config.html");

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  const { ChatGPTUnofficialProxyAPI } = await import("chatgpt");

  api = new ChatGPTUnofficialProxyAPI({
    accessToken: process.env.ACCESS_TOKEN,
    apiReverseProxyUrl: process.env.API_REVERSE_PROXY_URL,
  });

  createWindow();
  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.on(
  "register",
  async (event, message, discordWebhookURL, promptTitlesInput) => {
    if (pendingRequest) {
      mainWindow.webContents.send(
        "error",
        "Please wait for the conversation to be ready..."
      );
    } else {
      pendingRequest = true;
      try {
        const res = await api.sendMessage(message);
        conversationId = res.conversationId;
        parentMessageId = res.id;
        registered = true;

        if (discordWebhookURL) {
          webhookClient = new discord.WebhookClient({ url: discordWebhookURL });
        }

        promptTitles = promptTitlesInput;

        mainWindow.loadFile("./html/translate.html");

        setTimeout(() => {
          mainWindow.webContents.send(
            "console",
            `Please use "Command+Shift+}" to translate the current clipboard.\nIt will be outputted to ${
              discordWebhookURL
                ? "Discord"
                : "the console when using this keybind"
            }`
          );

          globalShortcut.register("CommandOrControl+Shift+}", () => {
            translate();
          });
        }, 300);
      } catch (err) {
        mainWindow.webContents.send(
          "error",
          "There was an error registering the chat."
        );
      }

      pendingRequest = false;
    }
  }
);

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

async function translate() {
  if (!registered) return;
  if (pendingRequest) {
    mainWindow.webContents.send(
      "console",
      "Please wait for the current request to finish before making another request!"
    );
    return;
  }

  const clipboardText = clipboard.readText();
  if (clipboardText.length === 0) return;

  let title;

  if (promptTitles) {
    try {
      const response = await prompt({
        title: "Translation Title",
        label: "Title:",
        inputAttrs: {
          type: "text",
        },
        type: "input",
      });

      if (response != null) title = response;
    } catch (error) {
      console.error(error);
      return;
    }
  }

  pendingRequest = true;

  try {
    mainWindow.webContents.send("console", "\n\nTranslating...");
    const lowercase = clipboardText.toLowerCase();
    const cleaned = lowercase.replace(/- /g, "");
    const res = await api.sendMessage(cleaned, {
      conversationId,
      parentMessageId,
    });

    if (webhookClient) {
      mainWindow.webContents.send("console", "\n\nSending to Discord...");
      webhookClient.send(`${title ? title : ""}\`\`\`${res.text}\`\`\``);
    } else {
      mainWindow.webContents.send(
        "console",
        "\n\nReturned Translation:\n" + (title ? title : "") + "\n" + res.text
      );
    }

    pendingRequest = false;
    parentMessageId = res.id;
  } catch (err) {
    mainWindow.webContents.send("console", err);
  }
}
