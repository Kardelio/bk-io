class User {
    constructor(id, username, email, hash, verified) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.hash = hash;
        this.verified = verified;
    }
    displayUser() {
        console.log(`User: ${this.id} -> ${this.username}`);
    }
    splitToString() {
        return `${this.id}|${this.username}|${this.email}|${this.hash}|${this.verified}`;
    }
}

module.exports = {
    User
}