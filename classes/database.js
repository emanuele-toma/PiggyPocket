// Create class Database that is a Singleton, it returns the promise of the database connection
class Database {
    constructor() {
        if (Database.instance instanceof Database) {
            return Database.instance;
        }

        const sqlite = require('sqlite');
        const sqlite3 = require('sqlite3');

        Database.instance = sqlite.open({
            filename: './database/database.sqlite',
            driver: sqlite3.Database
        });

        return Database.instance;
    }
}

module.exports = Database;