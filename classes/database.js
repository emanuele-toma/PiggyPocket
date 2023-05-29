class Database {
    static instance = null;

    constructor(db) {
        if (!this.instance) {
            this.instance = db;
        }

        console.log(this.instance);
        return this.instance;
    }
}

module.exports = new Database();