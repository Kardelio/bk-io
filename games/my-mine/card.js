// class Deck {
//     constructor(name) {
//         console.log("Created");
//         this.name = name;
//     }
// }

// class CaveDeck extends Deck {
//     constructor(effect, name) {
//         super(name);
//         this.effect = effect;
//     }
// }

class Card {
    constructor(name, tag, uniqId, trigger) {
        this.name = name;
        this.tag = tag;
        this.uniqId = uniqId;
        this.trigger = trigger;
    }

    activate(id) {
        this.trigger(id);
    }

    displayCard() {
        console.log(`${this.name} - ${this.tag}`);
    }
}


// class CaveCard extends Card {
//     constructor(amountOfGems, movementAmount, name, imgSrc) {
//         super(name, imgSrc);
//         this.amountOfGems = amountOfGems;
//         this.movementAmount = movementAmount;
//         this.displayEffect();
//     }

//     displayEffect() {
//         console.log(`${this.amountOfGems} - ${this.movementAmount} = ${this.name}`);
//     }
// }

// class ExitCard extends Card {
//     constructor(effect, name, imgSrc) {
//         super(name, imgSrc);
//         this.effect = effect;
//     }

//     displayEffect() {
//         console.log(`${this.effect} = ${this.name}`);
//     }
// }



/*
class Car {
  constructor(brand) {
    this.carname = brand;
  }
  present() {
    return 'I have a ' + this.carname;
  }
}

class Model extends Car {
  constructor(brand, mod) {
    super(brand);
    this.model = mod;
  }
  show() {
    return this.present() + ', it is a ' + this.model;
  }
}

let myCar = new Model("Ford", "Mustang");
document.getElementById("demo").innerHTML = myCar.show();
*/


module.exports = {
    Card
}