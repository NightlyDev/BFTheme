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