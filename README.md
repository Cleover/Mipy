# Mipy
Mipy is a user-friendly Electron application designed to facilitate text translation using ChatGPT, with a specific emphasis on manga translations. With Mipy, you can easily provide examples to ChatGPT, which is particularly useful when you want to maintain the speech style found in manga or novels.

# Features
Translation: Mipy utilizes the powerful ChatGPT language model to provide accurate and context-aware translations for your text.

Optional Example Translations: By providing examples, you can guide ChatGPT to generate translations that align with the desired speech style commonly found in manga and novels.

# Why use this over a normal ChatGPT window?
Mipy is designed specifically for manga translation with ChatGPT, offering several advantages over conventional interfaces:

Fast Translations: Mipy allows you to quickly translate manga pages by also using it with an OCR program. This way you can scan a page, use a keybind and have it translated (and optionally sent to a discord channel), making the process swift and efficient.

User-Friendly: Mipy provides an easy-to-use interface, making it accessible to users of all levels of technical expertise. You can save and load configs for different languages and writing styles to quickly pick things up another time

Discord Integration: Mipy allows you to include a Discord channel Webhook URL allowing you to quickly send your outputs to a discord channel for use with your team.

Choose Mipy to speed up your manga translation workflow and enjoy its user-friendly interface, OCR integration, and Discord integration.

## The Main Window
![main](./images/main.png)

## Translating Text
![example](./images/example.gif)


# Getting Started
To use Mipy, follow these steps:

Clone the Mipy repository to your local machine.
Fill out the config located in `Mipy/config/example.env` with your ChatGPT Access Token, and a API reverse proxy URL, one is provided in the config, however this may cease to work down the line.
Install the required dependencies by running `npm install` in the project directory.
Start the application by running `npm start`.

If you want to improve the translation results, you can include examples that reflect the desired speech style of manga or novels.

Happy translating with Mipy!
