// Requiring modules
const express = require("express");
const cors = require("cors");
const app = express();
const mssql = require("mssql");
const { start } = require("repl");
const https = require("https");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const MD5 = require("crypto-js/md5");

const port = 80;
const api_key = "asdfghjkl";
let logged_users_uuids = [];
let logged_admins_uuids = [];

const sqlconfig = {
  user: "sa",
  password: "maselko1",
  server: "172.25.0.1",
  database: "planlekcji",
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

const corsOptions = {
  origin: "http://localhost:8080",
  optionsSuccessStatus: 200,
  credentials: true,
};

const httpsOptions = {
  key: fs.readFileSync("./security/cert.key"),
  cert: fs.readFileSync("./security/cert.pem"),
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mssql.connect(sqlconfig, (err) => {
  if (err) {
    throw err;
  }
  console.log("Connection Successful!");
});

// Get request that returns info that the backend is living!
app.get("/", async (req, res) => {
  console.log("Request!");

  return res.send("Backend API online!");
});

//Empty POST request
app.post("/", (req, res) => {
  console.log("POST Request!");
  res.status(404).send("Nothing");
});

/**
 *  SELECT request to return all data in table
 * @param key api key
 * @param table table name to select data from
 */
app.post("/select", async (req, res) => {
  console.log("SELECT POST Request!");

  const key = req.body.key;
  if (validateAPIKey(key)) return res.status(401).send("Wrong api key");

  const table = req.body.table;
  if (!table) {
    console.error("To table in request");
    return res.status(400).send("No table in querry");
  }

  const request = new mssql.Request();
  request.input("table", mssql.VarChar, table);
  request.query(`SELECT * FROM ${table}`, (err, result) => {
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
  const pass = MD5(req.body.password).toString();

  console.log("Login: " + login + " Pass: " + pass);

  if (login == null || pass == null) {
    return res.status(400).json({ ok: false, reason: "no login or pass" });
  }

  const request = new mssql.Request();
  request.input("login", mssql.VarChar, login);
  request.input("pass", mssql.VarChar, pass);
  request.query(
    "SELECT employee_account_id, account_type_id, permission_level FROM Employees_accounts WHERE login = @login AND password = @pass",
    (err, result) => {
      if (err) {
        console.error("Error executing query: ", err);
        return res
          .status(400)
          .json({ ok: false, reason: "error during login check" });
      } else {
        if (result.recordset.length > 0) {
          console.log("Login successfull");
          console.dir(result.recordset);

          const new_uuid = uuidv4();
          if (result.recordset[0].account_type_id == 1) {
            logged_admins_uuids.push(new_uuid);
          }

          logged_users_uuids.push(new_uuid);

          return res.status(200).json({
            ok: true,
            token: new_uuid,
            userRole: result.recordset[0].account_type_id,
            id: result.recordset[0].employee_account_id,
            user: login,
          });
        } else {
          console.log("Not found login " + login);
          console.dir(result.recordset);
          return res.status(400).json({
            ok: false,
            reason: "wrong login or pass",
          });
        }
      }
    }
  );
});

app.post("/logout", (req, res) => {
  const key = req.body.key;
  if (validateAPIKey(key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }

  logged_users_uuids = logged_users_uuids.filter((uuid) => uuid !== key);
  return res.status(200).json({ ok: true });
});

//OPERACJE NA PLANIE

app.get("/plan-czesc", (req, res) => {
  let id = -1;
  start_date = "2025-01-06";
  end_date = "2025-01-12";

  if (req.query.id != null) {
    id = req.query.id;
  }
  if (req.query.start != null) {
    start_date = req.query.start;
  }
  if (req.query.end != null) {
    end_date = req.query.end;
  }

  const query =
    "SELECT Classes.class_id,Groups.group_number,Groups_type.type_name,Employees.position,Employees.first_name +' '+ Employees.last_name AS prowadzacy,Classes_dates.date,Classes_dates.start_time,Classes_dates.end_time,Rooms.room_number,Department.name AS room_department_name,state_name FROM Schedules JOIN Classes ON Schedules.schedule_id = Classes.schedule_id JOIN Classes_dates ON Classes_dates.class_id =  Classes.class_id JOIN Rooms ON Rooms.room_id = Classes_dates.room_id JOIN Department ON Department.department_id = Rooms.department_id JOIN Classes_state ON Classes_state.class_state_id = Classes_dates.state_id JOIN Employees ON Employees.employee_id = Classes.employee_id JOIN Groups ON Groups.group_id = Classes.group_id JOIN Groups_type ON Groups_type.group_type_id = Groups.group_type_id WHERE Schedules.schedule_id = @id AND date > @start_date AND date < @end_date ORDER BY Classes_dates.date";

  const request = new mssql.Request();
  request.input("id", mssql.Int, id);
  request.input("start_date", mssql.Date, start_date);
  request.input("end_date", mssql.Date, end_date);
  request.query(query, (err, result) => {
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

app.get("/plan", (req, res) => {
  const query =
    "SELECT Classes.class_id AS id, group_number, type_name AS type, Employees.first_name + ' ' + Employees.last_name AS instructor, Classes_dates.date, start_time, end_time, room_number AS room, Department.name AS room_department_name, state_name, Subject.name AS subject_name, Subject.course_code AS subject_code, Semesters.nr_semester AS semester, Direction.direction_name AS direction FROM Schedules JOIN Classes ON Schedules.schedule_id = Classes.schedule_id JOIN Classes_dates ON Classes_dates.class_id = Classes.class_id JOIN Rooms ON Rooms.room_id = Classes_dates.room_id JOIN Department ON Department.department_id = Rooms.department_id JOIN Classes_state ON Classes_state.class_state_id = Classes_dates.state_id JOIN Employees ON Employees.employee_id = Classes.employee_id JOIN Groups ON Groups.group_id = Classes.group_id JOIN Groups_type ON Groups_type.group_type_id = Groups.group_type_id JOIN Subject ON Subject.subject_id = Classes.subject_id JOIN Semesters ON Semesters.semester_id = Schedules.semester_id JOIN Direction ON Direction.direction_id = Schedules.direction_id;";

  //console.log(query);
  new mssql.Request().query(query, (err, result) => {
    if (err) {
      console.error("Error executing query: ", err);
      return res.status(400).send("No classess found for id ${id}");
    } else {
      console.log("Sending response querry object");
      //console.dir(result.recordset);
      return res.status(200).send(result.recordset);
    }
  });
});

//OPERACJE NA UŻYTKOWNIKACH

app.post("/profile/get-all", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res
      .status(401)
      .json({ ok: false, reason: "Invalid session key: " + req.body.key });
  }
  if (isAdminKey(req.body.key)) {
    return res
      .status(401)
      .json({ ok: false, reason: "Not admin session key: " + req.body.key });
  }

  new mssql.Request().query(
    "SELECT employee_account_id AS id, login, type_name AS account_type_name, Accounts_type.account_type_id AS account_type, first_name, last_name, Employees.employee_id FROM Employees_accounts LEFT JOIN Employees ON Employees_accounts.employee_id = Employees.employee_id JOIN Accounts_type ON Accounts_type.account_type_id = Employees_accounts.account_type_id",
    (err, result) => {
      if (err) {
        console.error("Error executing query: ", err);
        return res.status(500).json({ ok: false, reason: "Database error" });
      }
      console.log("Sending all users");
      return res.status(200).json({ ok: true, users: result.recordset });
    }
  );
});

app.post("/profile/get-accounts-types", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res
      .status(401)
      .json({ ok: false, reason: "Invalid session key: " + req.body.key });
  }

  new mssql.Request().query(
    "SELECT account_type_id AS id, type_name AS account_type FROM Accounts_type",
    (err, result) => {
      if (err) {
        console.error("Error executing query: ", err);
        return res.status(500).json({ ok: false, reason: "Database error" });
      }
      console.log("Sending all account types");
      return res
        .status(200)
        .json({ ok: true, account_types: result.recordset });
    }
  );
});

app.post("/profile/get", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }
  if (isAdminKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Not admin session key: "+req.body.key });
  }

  const id = req.body.user_id;
  if (id == null) {
    return res.status(400).json({ ok: false, reason: "No user id" });
  }

  const request = new mssql.Request();
  request.input("id", mssql.Int, id);
  request.query(
    "SELECT login, permission_level FROM Employees_accounts WHERE employee_account_id = @id",
    (err, result) => {
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
        } else {
          console.log("Not found user");
          console.dir(result.recordset);
          return res.status(200).json({
            ok: false,
            reason: "Not found user",
          });
        }
      }
    }
  );
});

app.post("/profile/add", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }
  if (isAdminKey(req.body.key)) {
    return res
      .status(401)
      .json({ ok: false, reason: "Not admin session key: " + req.body.key });
  }

  const login = req.body.login;
  const password = MD5(req.body.password).toString();
  const account_type = req.body.account_type;
  const employee_id = req.body.employee_id;
  if (login == null || password == null || account_type == null) {
    return res
      .status(400)
      .json({ ok: false, reason: "No user id, login or pl" });
  }

  const request = new mssql.Request();
  request.input("login", mssql.VarChar, login);
  request.input("password", mssql.VarChar, password);
  request.input("account_type", mssql.Int, account_type);
  request.input("employee_id", mssql.Int, employee_id);
  request.query(
    "INSERT INTO Employees_accounts (login, password, account_type_id, employee_id, permission_level) VALUES(@login, @password, @account_type, @employee_id, @account_type)",
    (err, result) => {
      if (err) {
        console.error("Error executing query: ", err);
        return res.status(400).json({ ok: false, reason: err.message });
      } else {
        console.dir(result.rowsAffected);
        return res.status(200).json({ ok: true });
      }
    }
  );
});

app.post("/profile/update", (req, res) => {
  console.log("Profile edit request");
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }
  if (isAdminKey(req.body.key)) {
    return res
      .status(401)
      .json({ ok: false, reason: "Not admin session key: " + req.body.key });
  }

  const id = req.body.id;
  const login = req.body.login;
  const password = MD5(req.body.password).toString();
  const account_type = req.body.account_type;
  const employee_id = req.body.employee_id;
  if (id == null || login == null || password == null || account_type == null) {
    return res
      .status(400)
      .json({
        ok: false,
        reason: "No user id, login, password or account_type",
      });
  }

  const request = new mssql.Request();
  request.input("id", mssql.Int, id);
  request.input("login", mssql.VarChar, login);
  request.input("password", mssql.VarChar, password);
  request.input("account_type", mssql.Int, account_type);
  request.input("employee_id", mssql.Int, employee_id);
  request.query(
    "UPDATE Employees_accounts SET login = @login, password = @password, account_type_id = @account_type, employee_id = @employee_id WHERE employee_account_id = @id",
    (err, result) => {
      if (err) {
        console.error("Error executing query: ", err);
        return res.status(400).json({ ok: false, reason: err.message });
      } else {
        console.dir(result.rowsAffected);
        return res.status(200).json({ ok: true });
      }
    }
  );
});

app.post("/profile/delete", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }
  if (isAdminKey(req.body.key)) {
    return res
      .status(401)
      .json({ ok: false, reason: "Not admin session key: " + req.body.key });
  }

  const id = req.body.id;
  if (id == null) {
    return res.status(400).json({ ok: false, reason: "No user id" });
  }

  const request = new mssql.Request();
  request.input("id", mssql.Int, id);
  request.query(
    "DELETE FROM Employees_accounts WHERE employee_account_id = @id",
    (err, result) => {
      if (err) {
        console.error("Error executing query: ", err);
        return res.status(400).json({ ok: false, reason: err.message });
      } else {
        console.dir(result.rowsAffected);
        return res.status(200).json({ ok: true });
      }
    }
  );
});

//CRUD EMPLOYEES
app.post("/employees/get-all", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }

  new mssql.Request().query(
    "SELECT employee_id AS id, first_name, last_name, position FROM Employees",
    (err, result) => {
      if (err) {
        console.error("Error executing query: ", err);
        return res.status(500).json({ ok: false, reason: "Database error" });
      }
      return res.status(200).json({ ok: true, employees: result.recordset });
    }
  );
});

app.post("/employees/get-all-joinedname", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }

  new mssql.Request().query(
    "SELECT employee_id AS id, first_name + ' ' + last_name AS name, position FROM Employees",
    (err, result) => {
      if (err) {
        console.error("Error executing query: ", err);
        return res.status(500).json({ ok: false, reason: "Database error" });
      }
      return res.status(200).json({ ok: true, employees: result.recordset });
    }
  );
});

app.post("/employees/add", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }
  if (isAdminKey(req.body.key)) {
    return res
      .status(401)
      .json({ ok: false, reason: "Not admin session key: " + req.body.key });
  }

  const first_name = req.body.first_name;
  const last_name = req.body.last_name;
  const position = req.body.position;
  if (first_name == null || last_name == null || position == null) {
    return res
      .status(400)
      .json({ ok: false, reason: "No first_name, last_name or position" });
  }

  const request = new mssql.Request();
  request.input("first_name", mssql.VarChar, first_name);
  request.input("last_name", mssql.VarChar, last_name);
  request.input("position", mssql.VarChar, position);
  request.query(
    "INSERT INTO Employees (first_name, last_name, position) VALUES(@first_name, @last_name, @position)",
    (err, result) => {
      if (err) {
        console.error("Error executing query: ", err);
        return res.status(400).json({ ok: false, reason: err.message });
      } else {
        return res.status(200).json({ ok: true });
      }
    }
  );
});

app.post("/employees/update", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }
  if (isAdminKey(req.body.key)) {
    return res
      .status(401)
      .json({ ok: false, reason: "Not admin session key: " + req.body.key });
  }

  const id = req.body.id;
  const first_name = req.body.first_name;
  const last_name = req.body.last_name;
  const position = req.body.position;
  if (
    id == null ||
    first_name == null ||
    last_name == null ||
    position == null
  ) {
    return res
      .status(400)
      .json({ ok: false, reason: "No id, first_name, last_name or position" });
  }

  const request = new mssql.Request();
  request.input("id", mssql.Int, id);
  request.input("first_name", mssql.VarChar, first_name);
  request.input("last_name", mssql.VarChar, last_name);
  request.input("position", mssql.VarChar, position);
  request.query(
    "UPDATE Employees SET first_name = @first_name, last_name = @last_name, position = @position WHERE employee_id = @id",
    (err, result) => {
      if (err) {
        console.error("Error executing query: ", err);
        return res.status(400).json({ ok: false, reason: err.message });
      } else {
        return res.status(200).json({ ok: true });
      }
    }
  );
});

app.post("/employees/delete", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }
  if (isAdminKey(req.body.key)) {
    return res
      .status(401)
      .json({ ok: false, reason: "Not admin session key: " + req.body.key });
  }

  const id = req.body.id;
  if (id == null) {
    return res.status(400).json({ ok: false, reason: "No id" });
  }

  const request = new mssql.Request();
  request.input("id", mssql.Int, id);
  request.query(
    "DELETE FROM Employees WHERE employee_id = @id",
    (err, result) => {
      if (err) {
        console.error("Error executing query: ", err);
        return res.status(400).json({ ok: false, reason: err.message });
      } else {
        return res.status(200).json({ ok: true });
      }
    }
  );
});

//CRUD USER TYPES
app.post("/user-types/get-all", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }

  new mssql.Request().query(
    "SELECT account_type_id AS id, type_name AS account_type_name FROM Accounts_type",
    (err, result) => {
      if (err) {
        console.error("Error executing query: ", err);
        return res.status(500).json({ ok: false, reason: "Database error" });
      }
      return res
        .status(200)
        .json({ ok: true, account_types: result.recordset });
    }
  );
});

app.post("/user-types/add", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }
  if (isAdminKey(req.body.key)) {
    return res
      .status(401)
      .json({ ok: false, reason: "Not admin session key: " + req.body.key });
  }

  const account_type_name = req.body.account_type_name;
  if (account_type_name == null) {
    return res.status(400).json({ ok: false, reason: "No account_type_name" });
  }

  const request = new mssql.Request();
  request.input("account_type_name", mssql.VarChar, account_type_name);
  request.query(
    "INSERT INTO Accounts_type (type_name) VALUES(@account_type_name)",
    (err, result) => {
      if (err) {
        console.error("Error executing query: ", err);
        return res.status(400).json({ ok: false, reason: err.message });
      } else {
        return res.status(200).json({ ok: true });
      }
    }
  );
});

app.post("/user-types/update", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }
  if (isAdminKey(req.body.key)) {
    return res
      .status(401)
      .json({ ok: false, reason: "Not admin session key: " + req.body.key });
  }

  const id = req.body.id;
  const account_type_name = req.body.account_type_name;
  if (id == null || account_type_name == null) {
    return res
      .status(400)
      .json({ ok: false, reason: "No id or account_type_name" });
  }

  const request = new mssql.Request();
  request.input("id", mssql.Int, id);
  request.input("account_type_name", mssql.VarChar, account_type_name);
  request.query(
    "UPDATE Accounts_type SET type_name = @account_type_name WHERE account_type_id = @id",
    (err, result) => {
      if (err) {
        console.error("Error executing query: ", err);
        return res.status(400).json({ ok: false, reason: err.message });
      } else {
        return res.status(200).json({ ok: true });
      }
    }
  );
});

app.post("/user-types/delete", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }
  if (isAdminKey(req.body.key)) {
    return res
      .status(401)
      .json({ ok: false, reason: "Not admin session key: " + req.body.key });
  }

  const id = req.body.id;
  if (id == null) {
    return res.status(400).json({ ok: false, reason: "No id" });
  }

  const request = new mssql.Request();
  request.input("id", mssql.Int, id);
  request.query(
    "DELETE FROM Accounts_type WHERE account_type_id = @id",
    (err, result) => {
      if (err) {
        console.error("Error executing query: ", err);
        return res.status(400).json({ ok: false, reason: err.message });
      } else {
        return res.status(200).json({ ok: true });
      }
    }
  );
});

//CRUD DIRECTIONS

app.post("/directions/get-all", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }

  new mssql.Request().query("SELECT * FROM Direction", (err, result) => {
    if (err) {
      console.error("Error executing query: ", err);
      return res.status(500).json({ ok: false, reason: "Database error" });
    }
    return res.status(200).json({ ok: true, directions: result.recordset });
  });
});

app.post("/directions/add", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }
  if (isAdminKey(req.body.key)) {
    return res
      .status(401)
      .json({ ok: false, reason: "Not admin session key: " + req.body.key });
  }

  const direction_name = req.body.direction_name;
  if (direction_name == null) {
    return res.status(400).json({ ok: false, reason: "No direction_name" });
  }

  const request = new mssql.Request();
  request.input("direction_name", mssql.VarChar, direction_name);
  request.query(
    "INSERT INTO Direction (direction_name) VALUES(@direction_name)",
    (err, result) => {
      if (err) {
        console.error("Error executing query: ", err);
        return res.status(400).json({ ok: false, reason: err.message });
      } else {
        return res.status(200).json({ ok: true });
      }
    }
  );
});

app.post("/directions/update", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }
  if (isAdminKey(req.body.key)) {
    return res
      .status(401)
      .json({ ok: false, reason: "Not admin session key: " + req.body.key });
  }

  const id = req.body.id;
  const direction_name = req.body.direction_name;
  if (id == null || direction_name == null) {
    return res
      .status(400)
      .json({ ok: false, reason: "No id or direction_name" });
  }

  const request = new mssql.Request();
  request.input("id", mssql.Int, id);
  request.input("direction_name", mssql.VarChar, direction_name);
  request.query(
    "UPDATE Direction SET direction_name = @direction_name WHERE direction_id = @id",
    (err, result) => {
      if (err) {
        console.error("Error executing query: ", err);
        return res.status(400).json({ ok: false, reason: err.message });
      } else {
        return res.status(200).json({ ok: true });
      }
    }
  );
});

app.post("/directions/delete", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }
  if (isAdminKey(req.body.key)) {
    return res
      .status(401)
      .json({ ok: false, reason: "Not admin session key: " + req.body.key });
  }

  const id = req.body.id;
  if (id == null) {
    return res.status(400).json({ ok: false, reason: "No id" });
  }

  const request = new mssql.Request();
  request.input("id", mssql.Int, id);
  request.query(
    "DELETE FROM Direction WHERE direction_id = @id",
    (err, result) => {
      if (err) {
        console.error("Error executing query: ", err);
        return res.status(400).json({ ok: false, reason: err.message });
      } else {
        return res.status(200).json({ ok: true });
      }
    }
  );
});

//CRUD SPECIALIZATIONS
app.post("/specializations/get-all", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }

  new mssql.Request().query(
    "SELECT * FROM Direction_Specialization",
    (err, result) => {
      if (err) {
        console.error("Error executing query: ", err);
        return res.status(500).json({ ok: false, reason: "Database error" });
      }
      return res
        .status(200)
        .json({ ok: true, specializations: result.recordset });
    }
  );
});

app.post("/specializations/add", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }
  if (isAdminKey(req.body.key)) {
    return res
      .status(401)
      .json({ ok: false, reason: "Not admin session key: " + req.body.key });
  }

  const specialization_name = req.body.specialization_name;
  const direction_id = req.body.direction_id;
  if (specialization_name == null || direction_id == null) {
    return res
      .status(400)
      .json({ ok: false, reason: "No specialization_name" });
  }

  const request = new mssql.Request();
  request.input("specialization_name", mssql.VarChar, specialization_name);
  request.input("direction_id", mssql.Int, direction_id);
  request.query(
    "INSERT INTO Direction_Specialization (specialization_name, direction_id) VALUES(@specialization_name, @direction_id)",
    (err, result) => {
      if (err) {
        console.error("Error executing query: ", err);
        return res.status(400).json({ ok: false, reason: err.message });
      } else {
        return res.status(200).json({ ok: true });
      }
    }
  );
});

app.post("/specializations/update", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }
  if (isAdminKey(req.body.key)) {
    return res
      .status(401)
      .json({ ok: false, reason: "Not admin session key: " + req.body.key });
  }

  const id = req.body.id;
  const specialization_name = req.body.specialization_name;
  const direction_id = req.body.direction_id;
  if (id == null || specialization_name == null || direction_id == null) {
    return res
      .status(400)
      .json({ ok: false, reason: "No id or specialization_name" });
  }

  const request = new mssql.Request();
  request.input("id", mssql.Int, id);
  request.input("specialization_name", mssql.VarChar, specialization_name);
  request.input("direction_id", mssql.Int, direction_id);
  request.query(
    "UPDATE Direction_Specialization SET specialization_name = @specialization_name, direction_id = @direction_id WHERE direction_specialization_id = @id",
    (err, result) => {
      if (err) {
        console.error("Error executing query: ", err);
        return res.status(400).json({ ok: false, reason: err.message });
      } else {
        return res.status(200).json({ ok: true });
      }
    }
  );
});

app.post("/specializations/delete", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }
  if (isAdminKey(req.body.key)) {
    return res
      .status(401)
      .json({ ok: false, reason: "Not admin session key: " + req.body.key });
  }

  const id = req.body.id;
  if (id == null) {
    return res.status(400).json({ ok: false, reason: "No id" });
  }

  const request = new mssql.Request();
  request.input("id", mssql.Int, id);
  request.query(
    "DELETE FROM Direction_Specialization WHERE direction_specialization_id = @id",
    (err, result) => {
      if (err) {
        console.error("Error executing query: ", err);
        return res.status(400).json({ ok: false, reason: err.message });
      } else {
        return res.status(200).json({ ok: true });
      }
    }
  );
});

//CRUD CLASSESS STATES
app.post("/classes-states/get-all", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }

  new mssql.Request().query("SELECT * FROM Classes_state", (err, result) => {
    if (err) {
      console.error("Error executing query: ", err);
      return res.status(500).json({ ok: false, reason: "Database error" });
    }
    return res.status(200).json({ ok: true, states: result.recordset });
  });
});

app.post("/classes-states/add", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }
  if (isAdminKey(req.body.key)) {
    return res
      .status(401)
      .json({ ok: false, reason: "Not admin session key: " + req.body.key });
  }

  const state_name = req.body.state_name;
  if (state_name == null) {
    return res.status(400).json({ ok: false, reason: "No state_name" });
  }

  const request = new mssql.Request();
  request.input("state_name", mssql.VarChar, state_name);
  request.query(
    "INSERT INTO Classes_state (state_name) VALUES(@state_name)",
    (err, result) => {
      if (err) {
        console.error("Error executing query: ", err);
        return res.status(400).json({ ok: false, reason: err.message });
      } else {
        return res.status(200).json({ ok: true });
      }
    }
  );
});

app.post("/classes-states/update", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }
  if (isAdminKey(req.body.key)) {
    return res
      .status(401)
      .json({ ok: false, reason: "Not admin session key: " + req.body.key });
  }

  const id = req.body.id;
  const state_name = req.body.state_name;
  if (id == null || state_name == null) {
    return res.status(400).json({ ok: false, reason: "No id or state_name" });
  }

  const request = new mssql.Request();
  request.input("id", mssql.Int, id);
  request.input("state_name", mssql.VarChar, state_name);
  request.query(
    "UPDATE Classes_state SET state_name = @state_name WHERE class_state_id = @id",
    (err, result) => {
      if (err) {
        console.error("Error executing query: ", err);
        return res.status(400).json({ ok: false, reason: err.message });
      } else {
        return res.status(200).json({ ok: true });
      }
    }
  );
});

app.post("/classes-states/delete", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }
  if (isAdminKey(req.body.key)) {
    return res
      .status(401)
      .json({ ok: false, reason: "Not admin session key: " + req.body.key });
  }

  const id = req.body.id;
  if (id == null) {
    return res.status(400).json({ ok: false, reason: "No id" });
  }

  const request = new mssql.Request();
  request.input("id", mssql.Int, id);
  request.query(
    "DELETE FROM Classes_state WHERE class_state_id = @id",
    (err, result) => {
      if (err) {
        console.error("Error executing query: ", err);
        return res.status(400).json({ ok: false, reason: err.message });
      } else {
        return res.status(200).json({ ok: true });
      }
    }
  );
});

//CRUD SUBJECTS
app.post("/subjects/get-all", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }

  new mssql.Request().query("SELECT * FROM Subject", (err, result) => {
    if (err) {
      console.error("Error executing query: ", err);
      return res.status(500).json({ ok: false, reason: "Database error" });
    }
    return res.status(200).json({ ok: true, subjects: result.recordset });
  });
});

app.post("/subjects/add", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }
  if (isAdminKey(req.body.key)) {
    return res
      .status(401)
      .json({ ok: false, reason: "Not admin session key: " + req.body.key });
  }

  const name = req.body.name;
  const course_code = req.body.course_code;
  if (name == null || course_code == null) {
    return res
      .status(400)
      .json({ ok: false, reason: "No name or course_code" });
  }

  const request = new mssql.Request();
  request.input("name", mssql.VarChar, name);
  request.input("course_code", mssql.VarChar, course_code);
  request.query(
    "INSERT INTO Subject (name, course_code) VALUES(@name, @course_code)",
    (err, result) => {
      if (err) {
        console.error("Error executing query: ", err);
        return res.status(400).json({ ok: false, reason: err.message });
      } else {
        return res.status(200).json({ ok: true });
      }
    }
  );
});

app.post("/subjects/update", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }
  if (isAdminKey(req.body.key)) {
    return res
      .status(401)
      .json({ ok: false, reason: "Not admin session key: " + req.body.key });
  }

  const id = req.body.id;
  const name = req.body.name;
  const course_code = req.body.course_code;
  if (id == null || name == null || course_code == null) {
    return res
      .status(400)
      .json({ ok: false, reason: "No id, name or course_code" });
  }

  const request = new mssql.Request();
  request.input("id", mssql.Int, id);
  request.input("name", mssql.VarChar, name);
  request.input("course_code", mssql.VarChar, course_code);
  request.query(
    "UPDATE Subject SET name = @name, course_code = @course_code WHERE subject_id = @id",
    (err, result) => {
      if (err) {
        console.error("Error executing query: ", err);
        return res.status(400).json({ ok: false, reason: err.message });
      } else {
        return res.status(200).json({ ok: true });
      }
    }
  );
});

app.post("/subjects/delete", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }
  if (isAdminKey(req.body.key)) {
    return res
      .status(401)
      .json({ ok: false, reason: "Not admin session key: " + req.body.key });
  }

  const id = req.body.id;
  if (id == null) {
    return res.status(400).json({ ok: false, reason: "No id" });
  }

  const request = new mssql.Request();
  request.input("id", mssql.Int, id);
  request.query("DELETE FROM Subject WHERE subject_id = @id", (err, result) => {
    if (err) {
      console.error("Error executing query: ", err);
      return res.status(400).json({ ok: false, reason: err.message });
    } else {
      return res.status(200).json({ ok: true });
    }
  });
});

//CRUD GROUPS
app.post("/groups/get-all", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }

  new mssql.Request().query("SELECT * FROM Groups JOIN Groups_type ON Groups_type.group_type_id = Groups.group_type_id ", (err, result) => {
    if (err) {
      console.error("Error executing query: ", err);
      return res.status(500).json({ ok: false, reason: "Database error" });
    }
    return res.status(200).json({ ok: true, groups: result.recordset });
  });
});

app.post("/groups/add", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }
  if (isAdminKey(req.body.key)) {
    return res
      .status(401)
      .json({ ok: false, reason: "Not admin session key: " + req.body.key });
  }

  const group_number = req.body.group_number;
  const group_type_id = req.body.group_type_id;
  if (group_number == null || group_type_id == null ) {
    return res
      .status(400)
      .json({
        ok: false,
        reason: "No group_number, group_type_id",
      });
  }

  const request = new mssql.Request();
  request.input("group_number", mssql.Int, group_number);
  request.input("group_type_id", mssql.Int, group_type_id);
  request.query(
    "INSERT INTO Groups (group_number, group_type_id) VALUES(@group_number, @group_type_id)",
    (err, result) => {
      if (err) {
        console.error("Error executing query: ", err);
        return res.status(400).json({ ok: false, reason: err.message });
      } else {
        return res.status(200).json({ ok: true });
      }
    }
  );
});

app.post("/groups/update", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }
  if (isAdminKey(req.body.key)) {
    return res
      .status(401)
      .json({ ok: false, reason: "Not admin session key: " + req.body.key });
  }

  const id = req.body.id;
  const group_number = req.body.group_number;
  const group_type_id = req.body.group_type_id;
  if (
    id == null ||
    group_number == null ||
    group_type_id == null
  ) {
    return res
      .status(400)
      .json({
        ok: false,
        reason: "No id, group_number, group_type_id",
      });
  }

  const request = new mssql.Request();
  request.input("id", mssql.Int, id);
  request.input("group_number", mssql.Int, group_number);
  request.input("group_type_id", mssql.Int, group_type_id);
  request.query(
    "UPDATE Groups SET group_number = @group_number, group_type_id = @group_type_id WHERE group_id = @id",
    (err, result) => {
      if (err) {
        console.error("Error executing query: ", err);
        return res.status(400).json({ ok: false, reason: err.message });
      } else {
        return res.status(200).json({ ok: true });
      }
    }
  );
});

app.post("/groups/delete", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }
  if (isAdminKey(req.body.key)) {
    return res
      .status(401)
      .json({ ok: false, reason: "Not admin session key: " + req.body.key });
  }

  const id = req.body.id;
  if (id == null) {
    return res.status(400).json({ ok: false, reason: "No id" });
  }

  const request = new mssql.Request();
  request.input("id", mssql.Int, id);
  request.query("DELETE FROM Groups WHERE group_id = @id", (err, result) => {
    if (err) {
      console.error("Error executing query: ", err);
      return res.status(400).json({ ok: false, reason: err.message });
    } else {
      return res.status(200).json({ ok: true });
    }
  });
});

//CRUD GROUPS TYPES
app.post("/groups-types/get-all", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }

  new mssql.Request().query("SELECT * FROM Groups_type", (err, result) => {
    if (err) {
      console.error("Error executing query: ", err);
      return res.status(500).json({ ok: false, reason: "Database error" });
    }
    return res.status(200).json({ ok: true, groups_types: result.recordset });
  });
});

//CRUD ROOMS
app.post("/rooms/get-all", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }

  new mssql.Request().query("SELECT * FROM Rooms JOIN Department ON Department.department_id = Rooms.department_id", (err, result) => {
    if (err) {
      console.error("Error executing query: ", err);
      return res.status(500).json({ ok: false, reason: "Database error" });
    }
    return res.status(200).json({ ok: true, rooms: result.recordset });
  });
});

app.post("/rooms/add", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }
  if (isAdminKey(req.body.key)) {
    return res
      .status(401)
      .json({ ok: false, reason: "Not admin session key: " + req.body.key });
  }

  const room_number = req.body.room_number;
  const department_id = req.body.department_id;
  if (room_number == null || department_id == null) {
    return res
      .status(400)
      .json({ ok: false, reason: "No room_number or department_id" });
  }

  const request = new mssql.Request();
  request.input("room_number", mssql.Int, room_number);
  request.input("department_id", mssql.Int, department_id);
  request.query(
    "INSERT INTO Rooms (room_number, department_id) VALUES(@room_number, @department_id)",
    (err, result) => {
      if (err) {
        console.error("Error executing query: ", err);
        return res.status(400).json({ ok: false, reason: err.message });
      } else {
        return res.status(200).json({ ok: true });
      }
    }
  );
});

app.post("/rooms/update", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }
  if (isAdminKey(req.body.key)) {
    return res
      .status(401)
      .json({ ok: false, reason: "Not admin session key: " + req.body.key });
  }

  const id = req.body.id;
  const room_number = req.body.room_number;
  const department_id = req.body.department_id;
  if (id == null || room_number == null || department_id == null) {
    return res
      .status(400)
      .json({ ok: false, reason: "No id, room_number or department_id" });
  }

  const request = new mssql.Request();
  request.input("id", mssql.Int, id);
  request.input("room_number", mssql.Int, room_number);
  request.input("department_id", mssql.Int, department_id);
  request.query(
    "UPDATE Rooms SET room_number = @room_number, department_id = @department_id WHERE room_id = @id",
    (err, result) => {
      if (err) {
        console.error("Error executing query: ", err);
        return res.status(400).json({ ok: false, reason: err.message });
      } else {
        return res.status(200).json({ ok: true });
      }
    }
  );
});

app.post("/rooms/delete", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }
  if (isAdminKey(req.body.key)) {
    return res
      .status(401)
      .json({ ok: false, reason: "Not admin session key: " + req.body.key });
  }

  const id = req.body.id;
  if (id == null) {
    return res.status(400).json({ ok: false, reason: "No id" });
  }

  const request = new mssql.Request();
  request.input("id", mssql.Int, id);
  request.query("DELETE FROM Rooms WHERE room_id = @id", (err, result) => {
    if (err) {
      console.error("Error executing query: ", err);
      return res.status(400).json({ ok: false, reason: err.message });
    } else {
      return res.status(200).json({ ok: true });
    }
  });
});

//CRUD DEPARTMENTS
app.post("/departments/get-all", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }

  new mssql.Request().query(
    "SELECT * FROM Department JOIN Department_address ON Department.department_address_id = Department_address.department_address_id",
    (err, result) => {
      if (err) {
        console.error("Error executing query: ", err);
        return res.status(500).json({ ok: false, reason: "Database error" });
      }
      return res.status(200).json({ ok: true, departments: result.recordset });
    }
  );
});

app.post("/departments/add", async (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }
  if (isAdminKey(req.body.key)) {
    return res
      .status(401)
      .json({ ok: false, reason: "Not admin session key: " + req.body.key });
  }

  const name = req.body.name;
  const open_time = req.body.open_time;
  const close_time = req.body.close_time;
  const department_address = req.body.department_address;
  if (
    name == null ||
    open_time == null ||
    close_time == null ||
    department_address == null
  ) {
    return res.status(400).json({ ok: false, reason: "No name" });
  }

  const request = new mssql.Request();

  request.input("department_address", mssql.VarChar, department_address);
  await request.query(
    "INSERT INTO Department_address (street, phone_number) VALUES(@department_address, '')",
    (err, result) => {
      if (err) {
        console.error("Error executing query: ", err);
        return res.status(400).json({ ok: false, reason: err.message });
      }
    }
  );

  request.input("name", mssql.VarChar, name);
  request.input("open_time", mssql.Time, open_time);
  request.input("close_time", mssql.Time, close_time);
  await request.query(
    "INSERT INTO Department (name, open_time, close_time, department_address_id) VALUES(@name, @open_time, @close_time, (SELECT department_address_id FROM Department_address WHERE street = @department_address))",
    (err, result) => {
      if (err) {
        console.error("Error executing query: ", err);
        return res.status(400).json({ ok: false, reason: err.message });
      } else {
        return res.status(200).json({ ok: true });
      }
    }
  );
});

app.post("/departments/update", async (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }
  if (isAdminKey(req.body.key)) {
    return res
      .status(401)
      .json({ ok: false, reason: "Not admin session key: " + req.body.key });
  }

  const id = req.body.id;
  const name = req.body.name;
  const open_time = req.body.open_time;
  const close_time = req.body.close_time;
  const department_address = req.body.department_address;
  if (
    id == null ||
    name == null ||
    open_time == null ||
    close_time == null ||
    department_address == null
  ) {
    return res.status(400).json({ ok: false, reason: "No id or name" });
  }

  const request = new mssql.Request();

  request.input("department_address", mssql.VarChar, department_address);
  await request.query(
    "UPDATE Department_address SET street = @department_address WHERE department_address_id = (SELECT department_address_id FROM Department WHERE department_id = " +
      id +
      ")",
    (err, result) => {
      if (err) {
        console.error("Error executing query: ", err);
        return res.status(400).json({ ok: false, reason: err.message });
      }
    }
  );

  request.input("id", mssql.Int, id);
  request.input("name", mssql.VarChar, name);
  request.input("open_time", mssql.Time, open_time);
  request.input("close_time", mssql.Time, close_time);
  await request.query(
    "UPDATE Department SET name = @name, open_time = @open_time, close_time = @close_time WHERE department_id = @id",
    (err, result) => {
      if (err) {
        console.error("Error executing query: ", err);
        return res.status(400).json({ ok: false, reason: err.message });
      } else {
        return res.status(200).json({ ok: true });
      }
    }
  );
});

app.post("/departments/delete", async (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }
  if (isAdminKey(req.body.key)) {
    return res
      .status(401)
      .json({ ok: false, reason: "Not admin session key: " + req.body.key });
  }

  const id = req.body.id;
  if (id == null) {
    return res.status(400).json({ ok: false, reason: "No id" });
  }

  try {
    const request = new mssql.Request();

    request.input("id", mssql.Int, id);
    await request.query(`
      DELETE FROM Department_address 
      WHERE department_address_id = (
        SELECT department_address_id FROM Department WHERE department_id = @id
      )
    `);

    await request.query(`
      DELETE FROM Department 
      WHERE department_id = @id
    `);

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Error executing query: ", err);
    return res.status(400).json({ ok: false, reason: err.message });
  }
});

//CRUD SEMESTERS
app.post("/semesters/get-all", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }

  new mssql.Request().query("SELECT * FROM Semesters", (err, result) => {
    if (err) {
      console.error("Error executing query: ", err);
      return res.status(500).json({ ok: false, reason: "Database error" });
    }
    return res.status(200).json({ ok: true, semesters: result.recordset });
  });
});

app.post("/semesters/add", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }
  if (isAdminKey(req.body.key)) {
    return res
      .status(401)
      .json({ ok: false, reason: "Not admin session key: " + req.body.key });
  }

  const year_id = req.body.year_id;
  const nr_semester = req.body.nr_semester;
  const typ_semestru = req.body.typ_semestru;

  if (year_id == null || nr_semester == null || typ_semestru == null) {
    return res
      .status(400)
      .json({ ok: false, reason: "No year_id, nr_semester or typ_semestru" });
  }

  const request = new mssql.Request();
  request.input("year_id", mssql.Int, year_id);
  request.input("nr_semester", mssql.Int, nr_semester);
  request.input("typ_semestru", mssql.VarChar, typ_semestru);
  request.query(
    "INSERT INTO Semesters (year_id, nr_semester, typ_semestru) VALUES(@year_id, @nr_semester, @typ_semestru)",
    (err, result) => {
      if (err) {
        console.error("Error executing query: ", err);
        return res.status(400).json({ ok: false, reason: err.message });
      } else {
        return res.status(200).json({ ok: true });
      }
    }
  );
});

app.post("/semesters/update", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }
  if (isAdminKey(req.body.key)) {
    return res
      .status(401)
      .json({ ok: false, reason: "Not admin session key: " + req.body.key });
  }

  const id = req.body.id;
  const year_id = req.body.year_id;
  const nr_semester = req.body.nr_semester;
  const typ_semestru = req.body.typ_semestru;

  if (
    id == null ||
    year_id == null ||
    nr_semester == null ||
    typ_semestru == null
  ) {
    return res
      .status(400)
      .json({
        ok: false,
        reason: "No id, year_id, nr_semester or typ_semestru",
      });
  }

  const request = new mssql.Request();
  request.input("id", mssql.Int, id);
  request.input("year_id", mssql.Int, year_id);
  request.input("nr_semester", mssql.Int, nr_semester);
  request.input("typ_semestru", mssql.VarChar, typ_semestru);
  request.query(
    "UPDATE Semesters SET year_id = @year_id, nr_semester = @nr_semester, typ_semestru = @typ_semestru WHERE semester_id = @id",
    (err, result) => {
      if (err) {
        console.error("Error executing query: ", err);
        return res.status(400).json({ ok: false, reason: err.message });
      } else {
        return res.status(200).json({ ok: true });
      }
    }
  );
});

app.post("/semesters/delete", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }
  if (isAdminKey(req.body.key)) {
    return res
      .status(401)
      .json({ ok: false, reason: "Not admin session key: " + req.body.key });
  }

  const id = req.body.id;
  if (id == null) {
    return res.status(400).json({ ok: false, reason: "No id" });
  }

  const request = new mssql.Request();
  request.input("id", mssql.Int, id);
  request.query(
    "DELETE FROM Semesters WHERE semester_id = @id",
    (err, result) => {
      if (err) {
        console.error("Error executing query: ", err);
        return res.status(400).json({ ok: false, reason: err.message });
      } else {
        return res.status(200).json({ ok: true });
      }
    }
  );
});

//CRUD SEMESTER TYPES
app.post("/semester-types/get-all", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }

  new mssql.Request().query("SELECT * FROM SemesterType", (err, result) => {
    if (err) {
      console.error("Error executing query: ", err);
      return res.status(500).json({ ok: false, reason: "Database error" });
    }
    return res.status(200).json({ ok: true, semester_types: result.recordset });
  });
});

app.post("/semester-types/add", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }
  if (isAdminKey(req.body.key)) {
    return res
      .status(401)
      .json({ ok: false, reason: "Not admin session key: " + req.body.key });
  }

  const name = req.body.name;
  if (name == null) {
    return res.status(400).json({ ok: false, reason: "No name" });
  }

  const request = new mssql.Request();
  request.input("name", mssql.VarChar, name);
  request.query(
    "INSERT INTO SemesterType (name) VALUES(@name)",
    (err, result) => {
      if (err) {
        console.error("Error executing query: ", err);
        return res.status(400).json({ ok: false, reason: err.message });
      } else {
        return res.status(200).json({ ok: true });
      }
    }
  );
});

app.post("/semester-types/update", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }
  if (isAdminKey(req.body.key)) {
    return res
      .status(401)
      .json({ ok: false, reason: "Not admin session key: " + req.body.key });
  }

  const id = req.body.id;
  const name = req.body.name;
  if (id == null || name == null) {
    return res.status(400).json({ ok: false, reason: "No id or name" });
  }

  const request = new mssql.Request();
  request.input("id", mssql.Int, id);
  request.input("name", mssql.VarChar, name);
  request.query(
    "UPDATE SemesterType SET name = @name WHERE type_id = @id",
    (err, result) => {
      if (err) {
        console.error("Error executing query: ", err);
        return res.status(400).json({ ok: false, reason: err.message });
      } else {
        return res.status(200).json({ ok: true });
      }
    }
  );
});

app.post("/semester-types/delete", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }
  if (isAdminKey(req.body.key)) {
    return res
      .status(401)
      .json({ ok: false, reason: "Not admin session key: " + req.body.key });
  }

  const id = req.body.id;
  if (id == null) {
    return res.status(400).json({ ok: false, reason: "No id" });
  }

  const request = new mssql.Request();
  request.input("id", mssql.Int, id);
  request.query(
    "DELETE FROM SemesterType WHERE type_id = @id",
    (err, result) => {
      if (err) {
        console.error("Error executing query: ", err);
        return res.status(400).json({ ok: false, reason: err.message });
      } else {
        return res.status(200).json({ ok: true });
      }
    }
  );
});

//CRUD CLASSES
app.post("/classes/get-all", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }

  new mssql.Request().query(
    "SELECT * FROM Classes JOIN Subjects ON Subjects.subject_id = Classes.subject_id JOIN Classes_dates ON Classes.class_id = Classes_dates.class_id JOIN Rooms ON Rooms.room_id = Classes_dates.room_id JOIN Classes_state ON Classes_state.class_state_id = Classes_dates.state_id JOIN Groups ON Groups.group_id = Classes.group_id JOIN Employees ON Employees.employee_id = Classes.employee_id JOIN Schedules ON Schedules.schedule_id = Classes.schedule_id JOIN Direction ON Direction.direction_id = Schedules.direction_id JOIN Semesters ON Semesters.semester_id = Schedules.semester_id",
    (err, result) => {
      if (err) {
        console.error("Error executing query: ", err);
        return res.status(500).json({ ok: false, reason: "Database error" });
      }
      return res.status(200).json({ ok: true, classes: result.recordset });
    }
  );
});

app.post("/classes/get-by-dir-and-sem", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }

  const direction_id = req.body.direction_id;
  const semester_id = req.body.semester_id;
  if (direction_id == null || semester_id == null) {
    return res
      .status(400)
      .json({ ok: false, reason: "No direction_id or semester_id" });
  }

  const request = new mssql.Request();

  request.input("direction_id", mssql.Int, direction_id);
  request.input("semester_id", mssql.Int, semester_id);
  request.query(
    "SELECT class_id, Schedules.schedule_id, Employees.employee_id, Groups.group_id, Subject.subject_id, Groups_type.group_type_id, Direction.direction_id, Semesters.semester_id, group_number, Groups_type.type_name, Subject.name, Subject.course_code, first_name, last_name, position, direction_name, year_id, typ_semestru FROM Classes JOIN Groups ON Groups.group_id = Classes.group_id JOIN Groups_type ON Groups_type.group_type_id = Groups.group_type_id JOIN Subject ON Subject.subject_id = Classes.subject_id JOIN Employees ON Employees.employee_id = Classes.employee_id JOIN Schedules ON Schedules.schedule_id = Classes.schedule_id JOIN Direction ON Direction.direction_id = Schedules.direction_id JOIN Semesters ON Semesters.semester_id = Schedules.semester_id WHERE Schedules.direction_id = @direction_id AND Schedules.semester_id = @semester_id ORDER BY name",
    (err, result) => {
      if (err) {
        console.error("Error executing query: ", err);
        return res.status(500).json({ ok: false, reason: "Database error" });
      }
      return res.status(200).json({ ok: true, classes: result.recordset });
    }
  );
});

app.post("/classes/get-by-class", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }

  const class_id = req.body.class_id;
  if (class_id == null) {
    return res.status(400).json({ ok: false, reason: "No class_id" });
  }

  const request = new mssql.Request();
  request.input("class_id", mssql.Int, class_id);
  request.query(
    "SELECT * FROM Classes_dates JOIN Rooms ON Rooms.room_id = Classes_dates.room_id JOIN Department ON Department.department_id = Rooms.department_id JOIN Classes_state ON Classes_state.class_state_id = Classes_dates.state_id WHERE Classes_dates.class_id = @class_id",
    (err, result) => {
      if (err) {
        console.error("Error executing query: ", err);
        return res.status(500).json({ ok: false, reason: "Database error" });
      }
      return res.status(200).json({ ok: true, classes: result.recordset });
    }
  );
});

app.post("/classes/add", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }

  const direction_id = req.body.direction_id;
  const semester_id = req.body.semester_id;
  const employee_id = req.body.employee_id;
  const group_id = req.body.group_id;
  const subject_id = req.body.subject_id;

  if (direction_id == null || semester_id == null || employee_id == null || group_id == null || subject_id == null) {
    return res.status(400).json({ ok: false, reason: "No direction_id, semester_id, employee_id or group_id" });
  }

  const request = new mssql.Request();
  request.input("direction_id", mssql.Int, direction_id);
  request.input("semester_id", mssql.Int, semester_id);
  request.input("employee_id", mssql.Int, employee_id);
  request.input("group_id", mssql.Int, group_id);
  request.input("subject_id", mssql.Int, subject_id);
  request.query("INSERT INTO Classes (schedule_id, employee_id, group_id, subject_id) VALUES((SELECT schedule_id FROM Schedules WHERE direction_id=@direction_id AND semester_id=@semester_id), @employee_id, @group_id, @subject_id)", (err, result) => {
    if (err) {
      console.error("Error executing query: ", err);
      return res.status(400).json({ ok: false, reason: err.message });
    }
    return res.status(200).json({ ok: true });
  });
});

app.post("/classes/add-date", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }

  const class_id = req.body.class_id;
  const date = req.body.date;
  const room_id = req.body.room_id;
  const start_time = req.body.start_time;
  const end_time = req.body.end_time;
  if (class_id == null || date == null || room_id == null || start_time == null || end_time == null) {
    return res.status(400).json({ ok: false, reason: "No class_id, date, room_id, start_time or end_time" });
  }

  const request = new mssql.Request();
  request.input("class_id", mssql.Int, class_id);
  request.input("date", mssql.Date, date);
  request.input("room_id", mssql.Int, room_id);
  request.input("start_time", mssql.Time, start_time);
  request.input("end_time", mssql.Time, end_time);
  request.query("INSERT INTO Classes_dates (class_id, date, room_id, start_time, end_time, state_id) VALUES(@class_id, @date, @room_id, @start_time, @end_time, 1)", (err, result) => {
    if (err) {
      console.error("Error executing query: ", err);
      return res.status(400).json({ ok: false, reason: err.message });
    }
    return res.status(200).json({ ok: true });
  });
});

app.post("/classes/update", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }

  const id = req.body.id;
  const employee_id = req.body.employee_id;
  const group_id = req.body.group_id;
  const subject_id = req.body.subject_id;

  if(id == null || employee_id == null || group_id == null || subject_id == null) {
    return res.status(400).json({ ok: false, reason: "No id, name, start_time, end_time or room_number" });
  }

  const request = new mssql.Request();
  request.input("id", mssql.Int, id);
  request.input("employee_id", mssql.Int, employee_id);
  request.input("group_id", mssql.Int, group_id);
  request.input("subject_id", mssql.Int, subject_id);

  try{
    request.query("UPDATE Classes SET employee_id = @employee_id, group_id = @group_id, subject_id = @subject_id WHERE class_id = @id");

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Error executing query: ", err);
    return res.status(400).json({ ok: false, reason: err.message });
  }
});

app.post("/classes/delete", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }

  const id = req.body.id;
  if (id == null) {
    return res.status(400).json({ ok: false, reason: "No id" });
  }

  const request = new mssql.Request();
  request.input("id", mssql.Int, id);
  request.query("DELETE FROM Classes WHERE class_id = @id", (err, result) => {
    if (err) {
      console.error("Error executing query: ", err);
      return res.status(400).json({ ok: false, reason: err.message });
    }
    return res.status(200).json({ ok: true });
  });
});

app.post("/classes/delete-date", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }

  const id = req.body.id;
  if (id == null) {
    return res.status(400).json({ ok: false, reason: "No id" });
  }

  const request = new mssql.Request();
  request.input("id", mssql.Int, id);
  request.query("DELETE FROM Classes_dates WHERE class_date_id = @id", (err, result) => {
    if (err) {
      console.error("Error executing query: ", err);
      return res.status(400).json({ ok: false, reason: err.message });
    }
    return res.status(200).json({ ok: true });
  });
});

//START SERWERA
app.listen(port, function () {
  console.log("Server is listening at port " + port + "...");
});

const server = https.createServer(httpsOptions, app).listen(443, () => {
  console.log("https server running at " + 443);
});

/**
 *  Checks if string matches api_key
 * @param key key to validate
 * @returns true if key matches api_key
 */
function validateAPIKey(key) {
  //console.dir(logged_users_uuids);
  key = key.replace(/"/g, "");

  if (!key || !logged_users_uuids.includes(key)) {
    //if (!key || key != api_key) {
    console.error("Wrong API key: " + key);
    return true;
  }
  return false;
}

function isAdminKey(key) {
  key = key.replace(/"/g, "");
  if (!key || !logged_admins_uuids.includes(key)) {
    console.error("Not Admin key: " + key);
    return true;
  }
  return false;
}
