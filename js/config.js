const { ipcRenderer } = require("electron");

$.fn.selectpicker.Constructor.BootstrapVersion = "4";
const addButton = $("#add-button");
const saveButton = $("#save-button");
const loadButton = $("#load-button");
const registerButton = $("#register-button");
const promptButton = $("#prompt-button");

const container = $(".container");
const linesContainer = $(".lines");
const output = $("#output");
let baseText = "";

$(".overlay").hide();

$.get("./../config/base.txt", function (data) {
  baseText = data;
});

$.getJSON("./../config/lang.json", function (data) {
  const languageOriginSelect = $("#language-origin");
  const languageTargetSelect = $("#language-target");

  $.each(data, function (index, language) {
    const optionElement = $("<option>")
      .val(language.name)
      .attr(
        "data-content",
        `<img class="flag-icon" src="${language.image}"> ${language.name}`
      )
      .text(language.name);

    languageOriginSelect.append(optionElement.clone());
    languageTargetSelect.append(optionElement);
  });

  $(".selectpicker").selectpicker("refresh");
}).fail(function (error) {
  console.log("Error loading language options:", error);
});

addGroup();
addButton.on("click", addGroup);

function addGroup() {
  const textFieldGroup = $("<div>").addClass("text-field-group form-row").html(`
          <div class="col"><input type="text" class="form-control" placeholder="Enter text"></div>
          <div class="col-auto align-self-center"><span class="arrow">➡️</span></div>
          <div class="col"><input type="text" class="form-control" placeholder="Enter text"></div>
          <div class="col-auto align-self-center"><span class="remove-button">❌</span></div>
        `);

  linesContainer.prepend(textFieldGroup);

  textFieldGroup.find(".remove-button").on("click", function () {
    $(this).closest(".text-field-group").remove();
    updateOutput();
  });

  updateOutput();
}

function updateOutput() {
  output.find("code").html(generateScript(true));
}

function generateScript(includeHighlight) {
  if (baseText === "") {
    setTimeout(updateOutput, 100);
    return;
  }

  const languageOrigin = $("#language-origin");
  const languageTarget = $("#language-target");
  let outputText = baseText
    .replaceAll(
      "[ORIGIN]",
      includeHighlight
        ? `<span class="highlight-blue">${languageOrigin
            .find("option:selected")
            .text()}</span>`
        : languageOrigin.find("option:selected").text()
    )
    .replaceAll(
      "[TARGET]",
      includeHighlight
        ? `<span class="highlight-green">${languageTarget
            .find("option:selected")
            .text()}</span>`
        : languageTarget.find("option:selected").text()
    );

  const lines = [];
  $(".text-field-group").each(function () {
    const textFields = $(this).find("input");
    if (textFields[0].value !== "" && textFields[1].value !== "") {
      lines.push(
        includeHighlight
          ? `<span class="highlight-yellow">${textFields[0].value} -> ${textFields[1].value}</span>`
          : `${textFields[0].value} -> ${textFields[1].value}`
      );
    }
  });

  if (lines.length === 0) {
    lines.push(
      includeHighlight
        ? `<span class="highlight-red">[ No lines provided ]</span>`
        : "[ No lines provided ]"
    );
    $("#register-button").prop("disabled", true);
  } else {
    $("#register-button").prop("disabled", false);
  }

  return outputText.replace("[LINES]", lines.join("<br>"));
}

container.on("input", updateOutput);
$("#language-origin, #language-target").on("change", updateOutput);

updateOutput();

saveButton.on("click", function () {
  const languageOrigin = $("#language-origin");
  const languageTarget = $("#language-target");
  const lines = [];

  $(".text-field-group").each(function () {
    const textFields = $(this).find("input");
    if (textFields[0].value !== "" && textFields[1].value !== "") {
      lines.push([textFields[0].value, textFields[1].value]);
    }
  });

  const data = {
    languageOrigin: languageOrigin.val(),
    languageTarget: languageTarget.val(),
    lines: lines,
  };

  const a = $("<a>");
  const file = new Blob([JSON.stringify(data)], { type: "application/json" });
  a.attr("href", URL.createObjectURL(file));
  a.attr(
    "download",
    `[Mipy] ${languageOrigin.val()} to ${languageTarget.val()}.json`
  );
  a.get(0).click();
});

loadButton.on("click", function () {
  const input = $("<input>").attr({
    type: "file",
    accept: "application/json",
  });

  input.on("change", function (e) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.readAsText(file, "UTF-8");
    reader.onload = function (readerEvent) {
      const content = readerEvent.target.result;
      const data = JSON.parse(content);
      const languageOrigin = $("#language-origin");
      const languageTarget = $("#language-target");

      while ($(".text-field-group").length < data.lines.length) {
        addGroup();
      }

      while ($(".text-field-group").length > data.lines.length) {
        $(".text-field-group").last().remove();
      }

      $.each(data.lines, function (index, line) {
        const textFieldGroup = $(".text-field-group").eq(index);
        textFieldGroup.find("input").eq(0).val(line[0]);
        textFieldGroup.find("input").eq(1).val(line[1]);
      });

      languageOrigin.val(data.languageOrigin);
      languageTarget.val(data.languageTarget);

      $(".selectpicker").selectpicker("refresh");

      updateOutput();
    };
  });

  input.get(0).click();
});

registerButton.on("click", function () {
  let webhookURL = $("#discord-webhook-url").val();
  var regex = /^https:\/\/.*discord\.com\/api\/webhooks\/.*\/.*$/;

  if (webhookURL) {
    if (!regex.test(webhookURL)) {
      showError("Invalid Discord webhook URL");
    } else sendRegistration(webhookURL);
  } else sendRegistration(webhookURL);
});

function sendRegistration(webhookURL) {
  $(".overlay").show();
  ipcRenderer.send("register", generateScript(false), webhookURL, $("#prompt-button").hasClass("btn-success"));
}

ipcRenderer.on("error", async (event, message) => {
  $(".overlay").hide();
  showError(message);
});

function showError(message) {
  var modal = document.getElementById("errorModal");
  var errorMessageElement = document.getElementById("errorMessage");

  errorMessageElement.textContent = message;

  $(modal).modal("show");
}

promptButton.on("click", function () {
  if ($(this).hasClass("btn-danger")) {
    $(this).removeClass("btn-danger").addClass("btn-success");
    $(this).text("Prompt Titles");
  } else {
    $(this).removeClass("btn-success").addClass("btn-danger");
    $(this).text("Do Not Prompt Titles");
  }
});
