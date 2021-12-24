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


class ExitCard {
    constructor(name, tag, uniqId, optionOneText, triggerOne, optionTwoText, triggerTwo) {
        this.name = name;
        this.tag = tag;
        this.uniqId = uniqId;
        this.optionOneText = optionOneText;
        this.optionTwoText = optionTwoText;
        this.triggerOptions = {
            "1": triggerOne,
            "2": triggerTwo
        };
    }

    activateOption(option, id) {
        if (this.triggerOptions[option] != null) {
            this.triggerOptions[option](id);
        }
    }

    activate(id) {
        this.trigger(id);
    }

    displayCard() {
        console.log(`${this.name} - ${this.tag}`);
    }
}

module.exports = {
    Card,
    ExitCard
}