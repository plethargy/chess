const { Connection, Request } = require("tedious");
const config = {
  authentication: {
    options: {
      userName: "Team", // update me
      password: "Gr@Dchess7854548" // update me
    },
    type: "default"
  },
  server: "gradchess.database.windows.net", // update me
  options: {
    database: "Chess", //update me
    encrypt: true
  }
};


class Database {
  
  constructor() {
    
      this.results = null;
      this.connection = null;
  }

  connect(query) {
      this.connection = new Connection(config);

      this.connection.on("connect", err => {
        if (err) {
          console.error(err.message);
        } else {
          console.log("Connected")
          this.executeQuery(query);
        }
      });
  }

  executeQueryWithCallback(query, callback) {
    const request = new Request(
      `${query}`,
      (err, rowCount) => {
        if (err) {
          console.error(err.message);
        } else {
          console.log(`${rowCount} row(s) returned`);
        }
      }
    );
  
    request.on("row", columns => {
      columns.forEach(column => {
        console.log("%s\t%s", column.metadata.colName, column.value);
      });
    });
  
    this.connection.execSql(request);
  }

  executeQuery(query) {
    console.log(query);
    const request = new Request(
      `${query}`,
      (err, rowCount) => {
        if (err) {
          console.error(err.message);
        } else {
          console.log(`${rowCount} row(s) returned`);
        }

        this.connection.close();
      }
    );

    request.on("row", columns => {
      this.results = columns;
      
    });

    this.connection.execSql(request);
  }

  getResults()
  {
    return this.results;
  }



  disconnect() {
      this.connection.close();
  }
}

module.exports = Database;