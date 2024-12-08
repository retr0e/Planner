// Requiring modules
const express = require('express');
const cors = require("cors");
const app = express();
const mssql = require("mssql");

const port = 8080;
const api_key = "asdfghjkl";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sqlconfig = {
    user: 'sa',
    password: 'maselko1',
    server: '172.25.0.1',
    database: 'planlekcji',
    "options": {
        "encrypt": false, // Disable encryption
        
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
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");

    const key = req.query.key;
    if (!key || key != api_key) {
        return res.status(401).send("Wrong api key");
    }

    const table = req.query.table;
    if (!table) {
        return res.status(400).send("No table in querry");
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

app.post("/", (req, res) => {
    console.log("POST Request!");
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");

    res.status(404).send("Nothing");
})

app.post("/select", async (req, res) => {
    console.log("SELECT POST Request!");
    //res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");

    const key = req.body.key;
    if (!key || key != api_key) {
        console.error("Wrong API key: " + key);
        return res.status(401).send("Wrong api key");
    }

    console.log("L1");

    const table = req.body.table;
    if (!table) {
        console.error("To table in request");
        return res.status(400).send("No table in querry");
    }

    console.log("L2");
    
    new mssql.Request().query("SELECT * FROM "+table, (err, result) => {
        if (err) {
            console.error("Error executing query:", err);
        } else {
            console.log("Sending response querry object");
            res.send(result.recordset); // Send query result as response
            console.dir(result.recordset);
        }
    });
});

app.listen(port, function () {
    console.log('Server is listening at port '+ port +'...');
});