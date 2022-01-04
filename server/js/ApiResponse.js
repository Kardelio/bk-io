class ApiResponse {
    constructor() {
        this.status = true;
        this.message = "";
        this.data = null;
    }

    setNegativeResponse(msg) {
        this.status = false;
        this.message = msg;
    }
}

module.exports = ApiResponse;