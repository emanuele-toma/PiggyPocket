class Database {
    static instance = null;
    db = null;

    constructor(db) {
        if (!this.instance) {
            this.instance = this;
            this.db = db;
        }

        return this.instance.db;
    }
}

module.exports = Database;