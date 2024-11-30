// Requiring modules
const express = require('express');
const app = express();
const mssql = require("mssql");

const port = 8080;
const api_key = "asdfghjkl";

const sqlconfig = {
    user: 'sa',
    password: 'maselko1',
    server: '172.25.0.1',
    database: 'planlekcji',
    "options": {
        "encrypt": false // Disable encryption
    }
};

mssql.connect(sqlconfig, err => {
    if (err) {
        throw err;
    }
    console.log("Connection Successful!");
});

// Get request
app.get("/", async (req, res) => {
    console.log("Request!");

    return res.send("Backend API")
});

app.get("/select", async (req, res) => {
    console.log("SELECT Request!");

    const key = req.query.key;
        if (!key || key != api_key) {
            return res.send("Wrong api key");
        }

    const table = req.query.table;
    if (!table) {
        return res.send("No table in querry");
    }
    
    new mssql.Request().query("SELECT * FROM "+table, (err, result) => {
        if (err) {
            console.error("Error executing query:", err);
        } else {
            res.send(result.recordset); // Send query result as response
            console.dir(result.recordset);
        }
    });
});

app.listen(port, function () {
    console.log('Server is listening at port '+ port +'...');
});