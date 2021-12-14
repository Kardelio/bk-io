function Id() {
    // Math.random should be unique because of its seeding algorithm.
    // Convert it to base 36 (numbers + letters), and grab the first 9 characters
    // after the decimal.
    return '_' + Math.random().toString(36).substr(2, 9);
}

function compareTwoArrays(originalArray, newArray) {
    let left = [];
    let added = [];
    originalArray.forEach(playerObj => {
        if (newArray.findIndex(x => x.id == playerObj.id) == -1) {
            left.push(playerObj);
        }
    });
    if (originalArray.length > 0) {
        newArray.forEach(playerObj => {
            if (originalArray.findIndex(x => x.id == playerObj.id) == -1) {
                added.push(playerObj);
            }
        });
    }
    return {
        left: left,
        added: added
    }
}

function getTimeToDisplay() {
    let now = new Date();
    let paddedHours = String(now.getHours()).padStart(2, "0")
    let paddedMins = String(now.getMinutes()).padStart(2, "0")
    return paddedHours + ":" + paddedMins;
}