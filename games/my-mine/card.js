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
    constructor(name, tag, uniqId, optionOneText, triggerOne, triggerOneId, optionTwoText, triggerTwo, triggerTwoId) {
        this.name = name;
        this.tag = tag;
        this.uniqId = uniqId;
        this.triggerOptions = [];
        if (optionOneText != null && triggerOne != null) {
            this.triggerOptions.push({
                "description": optionOneText,
                "id": triggerOneId,
                "trigger": triggerOne
            })
        }
        if (optionTwoText != null && triggerTwo != null) {
            this.triggerOptions.push({
                "description": optionTwoText,
                "id": triggerTwoId,
                "trigger": triggerTwo
            })
        }
        // this.optionOneText = optionOneText;
        // this.optionTwoText = optionTwoText;
        // this.triggerOptions = {
        //     "1": triggerOne,
        //     "2": triggerTwo
        // };
    }

    //TODO
    activateOption(option, id) {
        console.log(this.triggerOptions);
        if (this.triggerOptions[option] != null) {
            console.log("Triggering option: " + this.triggerOptions[option].description);
            this.triggerOptions[option].trigger(id);
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