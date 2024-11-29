// models/userModel.js

class User {
    constructor(id, username, password, permissions = []) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.permissions = permissions;
    }
}

module.exports = User;
