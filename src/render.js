// define HTML elements
const primaryColor = document.getElementById('primary-color-picker');
const primaryTextField = document.getElementById('primary-color-value');

const accentColor = document.getElementById('accent-color-picker');
const accentTextField = document.getElementById('accent-color-value');

const friendlyColor = document.getElementById('friendly-color-picker');
const friendlyTextField = document.getElementById('friendly-color-value');

const enemyColor = document.getElementById('enemy-color-picker');
const enemyTextField = document.getElementById('enemy-color-value');

const squadColor = document.getElementById('squad-color-picker');
const squadTextField = document.getElementById('squad-color-value');

const neutralColor = document.getElementById('neutral-color-picker');
const neutralTextField = document.getElementById('neutral-color-value');

const allTextfields = document.querySelectorAll('input[type="text"]');
const allColorInputs = document.querySelectorAll('input[type="color"]');

for (let i = 0; i < allColorInputs.length; i++) {   // bind all colors/textfields, add eventlisteners
    allColorInputs[i].textfield = allTextfields[i];
    allTextfields[i].color = allColorInputs[i];
    allColorInputs[i].addEventListener("input", updateTextField, false);
    allTextfields[i].addEventListener("input", updateColor, false);
}

function updateTextField(event) {
    event.target.textfield.value = event.target.value.toUpperCase();
}

function updateColor(event) {
    event.target.color.value = event.target.value;
}

function updateAllColors() {
    allColorInputs.forEach(color => {
        color.value = color.textfield.value;
    })
}

async function exportTheme() {
    const { app, dialog } = require('electron');
    let theme = {
        "GstRender.HUD-Primary": primaryTextField.value,
        "GstRender.HUD-Accent": accentTextField.value,
        "GstRender.HUD-Friendly": friendlyTextField.value,
        "GstRender.HUD-Enemy": enemyTextField.value,
        "GstRender.HUD-Squad": squadTextField.value,
        "GstRender.HUD-Neutral": neutralTextField.value
    }

    let json = JSON.stringify(theme);
    dialog.showOpenDialog({
        defaultPath: app.getPath("desktop")
    })

    console.log(theme);
}

document.getElementById("load-button").addEventListener("click", async () => {
    const data = await window.api.loadConfig();
    let configColors = {};
    for (line of data.split('\n')) {
        if (line.includes("GstRender.HUD")) {
            line = line.split(' ');
            configColors[line[0]] = {
                "signed_int": Number(line[1]),
                "hexadecimal": DecimalHexTwosComplement(Number(line[1]))
            };
        }
    }

    primaryTextField.value = formatHexString(configColors["GstRender.HUD-Primary"].hexadecimal);
    accentTextField.value = formatHexString(configColors["GstRender.HUD-Accent"].hexadecimal)
    friendlyTextField.value = formatHexString(configColors["GstRender.HUD-Friendly"].hexadecimal)
    enemyTextField.value = formatHexString(configColors["GstRender.HUD-Enemy"].hexadecimal)
    squadTextField.value = formatHexString(configColors["GstRender.HUD-Squad"].hexadecimal)
    neutralTextField.value = formatHexString(configColors["GstRender.HUD-Neutral"].hexadecimal)

    updateAllColors();
})

document.getElementById("save-button").addEventListener("click", () => {
    let newColors = {
        "GstRender.HUD-Primary": convertHexToInt(primaryTextField.value),
        "GstRender.HUD-Accent": convertHexToInt(accentTextField.value),
        "GstRender.HUD-Friendly": convertHexToInt(friendlyTextField.value),
        "GstRender.HUD-Enemy": convertHexToInt(enemyTextField.value),
        "GstRender.HUD-Squad": convertHexToInt(squadTextField.value),
        "GstRender.HUD-Neutral": convertHexToInt(neutralTextField.value)
    }
    window.api.saveConfig(newColors);
})

document.getElementById("backup-button").addEventListener("click", () => {
    window.api.backupConfig();
})

document.getElementById("export-theme-button").addEventListener("click", () => {
    const theme = {
        "GstRender.HUD-Primary": primaryTextField.value,
        "GstRender.HUD-Accent": accentTextField.value,
        "GstRender.HUD-Friendly": friendlyTextField.value,
        "GstRender.HUD-Enemy": enemyTextField.value,
        "GstRender.HUD-Squad": squadTextField.value,
        "GstRender.HUD-Neutral": neutralTextField.value
    }
    window.api.exportTheme(JSON.stringify(theme, null, 4));
})

document.getElementById("import-theme-button").addEventListener("click", async () => {
    let themeJSON = await window.api.importTheme();
    themeJSON = JSON.parse(themeJSON);
    primaryTextField.value = themeJSON["GstRender.HUD-Primary"];
    accentTextField.value = themeJSON["GstRender.HUD-Accent"];
    friendlyTextField.value = themeJSON["GstRender.HUD-Friendly"];
    enemyTextField.value = themeJSON["GstRender.HUD-Enemy"];
    squadTextField.value = themeJSON["GstRender.HUD-Squad"];
    neutralTextField.value = themeJSON["GstRender.HUD-Neutral"];

    updateAllColors();
})