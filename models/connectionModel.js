// models/connectionModel.js

class Connection {
    constructor(id, userId, dbHost, dbPort, dbUsername, dbPassword, dbName) {
        this.id = id;
        this.userId = userId;
        this.dbHost = dbHost;
        this.dbPort = dbPort;
        this.dbUsername = dbUsername;
        this.dbPassword = dbPassword;
        this.dbName = dbName;
    }
}

module.exports = Connection;
