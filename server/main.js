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
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

mssql.connect(sqlconfig, err => {
    if (err) {
        throw err;
    }
    console.log("Connection Successful!");
});

// Get request that returns info that the backend is living!
app.get("/", async (req, res) => {
    console.log("Request!");

    return res.send("Backend API online!")
});

//Empty POST request
app.post("/", (req, res) => {
    console.log("POST Request!");
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");

    res.status(404).send("Nothing");
})

/**
 *  SELECT request to return all data in table
 * @param key api key
 * @param table table name to select data from
 */
app.post("/select", async (req, res) => {
    console.log("SELECT POST Request!");

    const key = req.body.key;
    if (!validateAPIKey(key)) return res.status(401).send("Wrong api key");

    const table = req.body.table;
    if (!table) {
        console.error("To table in request");
        return res.status(400).send("No table in querry");
    }
    
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

//LOGOWANIE

app.post("/login", (req, res) => {
    console.log("Login attempt " + req.hostname);
    //res.setHeader("Content-Type", "application/json");
    const login = req.body.login;
    const pass = req.body.password;

    if (login == null || pass == null) {

        return res.status(400).json({ok: false, reason: "no login or pass"});
    }

    new mssql.Request().query("SELECT employee_account_id, account_type_id, permission_level FROM Employees_accounts WHERE login = '"+login+"' AND password = '"+pass+"'", (err, result) => {
        if (err) {
            console.error("Error executing query: ", err);
            return res.status(400).json({ok: false, reason: "error during login check"});
        } else {
            if (result.recordset.length > 0) {
                console.log("Login successfull");
                console.dir(result.recordset);
                return res.status(200).json({
                    ok: true,
                    key: "asdfghjkl",
                    permission_level: result.recordset[0].permission_level,
                    id: result.recordset[0].employee_account_id
                });
            }
            else {
                console.log("Not found login " + login );
                console.dir(result.recordset);
                return res.status(400).json({
                    ok: false,
                    reason: "wrong login or pass"
                });
            }
        }
    });
});

//OPERACJE NA PLANIE

app.get("/plan", (req, res) => {
    
    let id = -1;
    
    if (req.query.id != null) {
        id = req.query.id;
    }

    const query = "SELECT group_number,type_name,Employees.first_name +' '+ Employees.last_name AS prowadzacy,Classes_dates.date,start_time,end_time,room_number,Department.name AS room_department_name,state_name FROM Schedules JOIN Classes ON Schedules.schedule_id = Classes.schedule_id JOIN Classes_dates ON Classes_dates.class_id =  Classes.class_id JOIN Rooms ON Rooms.room_id = Classes_dates.room_id JOIN Department ON Department.department_id = Rooms.department_id JOIN Classes_state ON Classes_state.class_state_id = Classes_dates.state_id JOIN Employees ON Employees.employee_id = Classes.employee_id JOIN Groups ON Groups.group_id = Classes.group_id JOIN Groups_type ON Groups_type.group_type_id = Groups.group_type_id WHERE Schedules.schedule_id ="+id;

    new mssql.Request().query(query, (err, result) => {
        if (err) {
            console.error("Error executing query: ", err);
            return res.status(400).send("No classess found for id ${id}");
        } else {
            console.log("Sending response querry object");
            console.dir(result.recordset);
            return res.status(200).send(result.recordset);
        }
    });
});

//OPERACJE NA UŻYTKOWNIKACH

app.post("/profile/get", (req, res) => {
    if (req.body.key != api_key) {
        return res.status(401).json({ok: false, reason: "Invalid session key"});
    }

    const id = req.body.user_id;
    if (id == null) {
        return res.status(400).json({ok: false, reason: "No user id"});
    }

    new mssql.Request().query("SELECT login, permission_level FROM Employees_accounts WHERE employee_account_id ="+id, (err, result) => {
        if (err) {
            console.error("Error executing query: ", err);
            return res.status(400).send("No user found for id ${id}");
        } else {
            if (result.recordset.length > 0) {
                console.dir(result.recordset);
                return res.status(200).json({
                    ok: true,
                    login: result.recordset[0].login,
                    permission_level: result.recordset[0].permission_level,
                });
            }
            else {
                console.log("Not found user");
                console.dir(result.recordset);
                return res.status(200).json({
                    ok: false,
                    reason: "Not found user"
                });
            }
        }
    });
});

app.post("/profile/edit", (req, res) => {
    console.log("Profile edit request");
    if (req.body.key != api_key) {
        return res.status(401).json({ok: false, reason: "Invalid session key"});
    }

    const id = req.body.user_id;
    const login = req.body.newLogin;
    const password = req.body.newPassword;
    const permission_level = req.body.newPermission_level;
    if (id == null || login == null || password == null || permission_level == null) {
        return res.status(400).json({ok: false, reason: "No user id, login or pl"});
    }

    new mssql.Request().query("UPDATE Employees_accounts SET login = '"+login+"', permission_level = "+permission_level+" WHERE employee_account_id ="+id, (err, result) => {
        if (err) {
            console.error("Error executing query: ", err);
            return res.status(400).json({ok: false, reason: err.message});
        } else {
            console.dir(result.rowsAffected);
            return res.status(200).json({ok: true});
        }
    });
});

app.listen(port, function () {
    console.log('Server is listening at port '+ port +'...');
});

/**
 *  Checks if string matches api_key
 * @param key key to validate
 * @returns true if key matches api_key
 */
function validateAPIKey(key) {
    if (!key || key != api_key) {
        console.error("Wrong API key: " + key);
        return false;
    }
    return true;
}