class Database {
    static instance = null;

    constructor(db) {
        if (!this.instance) {
            this.instance = db;
        }
        return this.instance;
    }
}

module.exports = Database;