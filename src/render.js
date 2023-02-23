// Colors
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

// some other
const path = "C:\\Users\\Day\\Documents\\Battlefield 2042\\settings\\PROFSAVE_profile";

const allTextfields = document.querySelectorAll('input[type="text"]');
const allColorInputs = document.querySelectorAll('input[type="color"]');

for (let i = 0; i < allColorInputs.length; i++) {   // bind all colors/textfields, add eventlisteners
    allColorInputs[i].textfield = allTextfields[i];
    allTextfields[i].color = allColorInputs[i];
    allColorInputs[i].addEventListener("input", updateTextField, false);
    allTextfields[i].addEventListener("input", updateColor, false);
}

function updateTextField(event) {
    event.target.textfield.value = event.target.value;
}

function updateColor(event) {
    event.target.color.value = event.target.value;
}

function updateAllColors() {
    allColorInputs.forEach(color => {
        color.value = color.textfield.value;
    })
}

function loadConfig() {
    let configColors = {};

    let lineReader = require('readline').createInterface({
        input: require('fs').createReadStream(path)
    });

    lineReader.on('line', (line) => {
        if (line.includes("HUD")) {
            line = line.split(' ');
            line[0] = line[0].replace("GstRender.HUD-", "");
            configColors[line[0]] = {
                "signed_int": Number(line[1]),
                "hexadecimal": DecimalHexTwosComplement(Number(line[1]))
            };
        }
    });

    lineReader.on('close', () => {
        primaryTextField.value = formatHexString(configColors.Primary.hexadecimal);
        accentTextField.value = formatHexString(configColors.Accent.hexadecimal)
        friendlyTextField.value = formatHexString(configColors.Friendly.hexadecimal)
        enemyTextField.value = formatHexString(configColors.Enemy.hexadecimal)
        squadTextField.value = formatHexString(configColors.Squad.hexadecimal)
        neutralTextField.value = formatHexString(configColors.Neutral.hexadecimal)

        updateAllColors();
    })
}

async function saveConfig() {
    let fs = require('fs').promises;
    console.log("Attempt to save")
    let newColors = {
        "GstRender.HUD-Primary": convertHexToInt(primaryTextField.value),
        "GstRender.HUD-Accent": convertHexToInt(accentTextField.value),
        "GstRender.HUD-Friendly": convertHexToInt(friendlyTextField.value),
        "GstRender.HUD-Enemy": convertHexToInt(enemyTextField.value),
        "GstRender.HUD-Squad": convertHexToInt(squadTextField.value),
        "GstRender.HUD-Neutral": convertHexToInt(neutralTextField.value)
    }

    const configStrings = [
        "GstRender.HUD-Primary", "GstRender.HUD-Accent", "GstRender.HUD-Friendly",
        "GstRender.HUD-Enemy", "GstRender.HUD-Squad", "GstRender.HUD-Neutral"
    ];
    for await (searchstr of configStrings) {
        const file = await fs.readFile(path, 'utf8');
        let re = new RegExp('^.*' + searchstr + '.*$', 'gm')
        let formatted = file.replace(re, `${searchstr} ${newColors[searchstr]}`);
        await fs.writeFile(path, formatted, 'utf8');
    }
}