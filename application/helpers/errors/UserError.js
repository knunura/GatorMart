class UserError extends Error{
    constructor(message, redirectURL, status) {
        super(message);
        this.redirectURL = redirectURL;
        this.status = status;
    }
}

module.exports = UserError;