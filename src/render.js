// References
const convertButton = document.getElementById('convert');
const integerLabel = document.getElementById('integer');
const hexaLabel = document.getElementById('hexadecimal');

function convertIntToHex() {
    let hexa = hexaLabel.innerHTML;
    hexa = ~~parseInt(hexa, 16);
    integerLabel.innerHTML = hexa;
}