const mysql = require('mysql');
class Database {
    constructor() {
        this.connection = mysql.createConnection({
            host: "gradchess.database.windows.net",
            user: "Team",
            password: "Gr\@Dchess7854548",
            database: "Chess"
          });
    }

    connect() {
        this.connection.connect((err) =>{
            if (err)
            {
                console.log(err.stack);
                throw err;
            }
            
            console.log("Connected to DB");
        });
    }

    executeQuery(query, callback) {
        this.connection.query(query, (err, result) => {
            if (err)
                throw err;
            callback(result);
        });
    }



    disconnect() {
        this.connection.end();
    }
}

module.exports = Database;