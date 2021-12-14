function continueToAskForBits() {
    // requestAAbits();
    // setInterval(() => {
    //     requestAAbits();
    // }, 5000);
}

function requestAAbits() {
    aaBitsCurl()
        .then(d => {
            console.log(d);
            displayAABits(d);
        })
        .catch(err => {
            console.log(err);
        });

}

function aaBitsCurl() {
    return new Promise((res, rej) => {
        fetch("/aabits")
            .then((data) => {
                return data.json();
            })
            .then(d => {
                res(d);
            })
            .catch((err) => {
                rej(err.message);
            })
    });
}

function displayAABits(bits) {
    bits.sort((a, b) => {
        return parseFloat(a.amount) - parseFloat(b.amount);
    });
    bits.reverse();
    const shorterBits = bits.slice(0, 12);

    let out = "";

    shorterBits.forEach((single, index) => {
        out += `
            <div class="single-bits-row ${index % 2 == 0 ? "row-even" : "row-odd"}">
                <div class="single-bits-row-name">${single.name}</div>
                <div class="single-bits-row-amount">${single.amount}</div>
            </div>
        `;
    });
    document.getElementById("aabits-div").innerHTML = out;
}