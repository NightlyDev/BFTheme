// Small collection of functions for converting DICEs color representation back and forth

// https://stackoverflow.com/a/63413597/6284787
function DecimalHexTwosComplement(decimal) {
    var size = 8;

    if (decimal >= 0) {
        var hexadecimal = decimal.toString(16);

        while ((hexadecimal.length % size) != 0) {
            hexadecimal = "" + 0 + hexadecimal;
        }

        return hexadecimal;
    } else {
        var hexadecimal = Math.abs(decimal).toString(16);
        while ((hexadecimal.length % size) != 0) {
            hexadecimal = "" + 0 + hexadecimal;
        }

        var output = '';
        for (i = 0; i < hexadecimal.length; i++) {
            output += (0x0F - parseInt(hexadecimal[i], 16)).toString(16);
        }

        output = (0x01 + parseInt(output, 16)).toString(16);
        return output;
    }
}

function formatHexString(hexadecimal) {
    return `#${hexadecimal}`.slice(0,-2).toUpperCase();
}

function convertHexToInt(hexadecimal) {
    return ~~parseInt(hexadecimal, 16); // some magic
}