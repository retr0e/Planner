// Requiring modules
const express = require("express");
const cors = require("cors");
const app = express();
const mssql = require("mssql");
const { start } = require("repl");
const https = require('https');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const port = 80;
const api_key = "asdfghjkl";
let logged_users_uuids = [];

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
  key: fs.readFileSync('./security/cert.key'),
  cert: fs.readFileSync('./security/cert.pem')
}

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
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");

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

  new mssql.Request().query("SELECT * FROM " + table, (err, result) => {
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
    return res.status(400).json({ ok: false, reason: "no login or pass" });
  }

  new mssql.Request().query(
    "SELECT employee_account_id, account_type_id, permission_level FROM Employees_accounts WHERE login = '" +
      login +
      "' AND password = '" +
      pass +
      "'",
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
          logged_users_uuids.push(new_uuid);

          return res.status(200).json({
            ok: true,
            token: api_key,
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
    "SELECT Classes.class_id,Groups.group_number,Groups_type.type_name,Employees.position,Employees.first_name +' '+ Employees.last_name AS prowadzacy,Classes_dates.date,Classes_dates.start_time,Classes_dates.end_time,Rooms.room_number,Department.name AS room_department_name,state_name FROM Schedules JOIN Classes ON Schedules.schedule_id = Classes.schedule_id JOIN Classes_dates ON Classes_dates.class_id =  Classes.class_id JOIN Rooms ON Rooms.room_id = Classes_dates.room_id JOIN Department ON Department.department_id = Rooms.department_id JOIN Classes_state ON Classes_state.class_state_id = Classes_dates.state_id JOIN Employees ON Employees.employee_id = Classes.employee_id JOIN Groups ON Groups.group_id = Classes.group_id JOIN Groups_type ON Groups_type.group_type_id = Groups.group_type_id WHERE Schedules.schedule_id = "+id+" AND date > '"+start_date+"' AND date < '"+end_date+"' ORDER BY Classes_dates.date";

    //console.log(query);
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

app.get("/plan", (req, res) => {
  const query =
    "SELECT Classes.class_id AS id, group_number, type_name AS type, Employees.first_name + ' ' + Employees.last_name AS instructor, Classes_dates.date, start_time, end_time, room_number AS room, Department.name AS room_department_name, state_name, Subject.name AS subject_name, Subject.course_code AS subject_code, Semesters.nr_semester AS semester, Direction.direction_name AS direction FROM Schedules JOIN Classes ON Schedules.schedule_id = Classes.schedule_id JOIN Classes_dates ON Classes_dates.class_id = Classes.class_id JOIN Rooms ON Rooms.room_id = Classes_dates.room_id JOIN Department ON Department.department_id = Rooms.department_id JOIN Classes_state ON Classes_state.class_state_id = Classes_dates.state_id JOIN Employees ON Employees.employee_id = Classes.employee_id JOIN Groups ON Groups.group_id = Classes.group_id JOIN Groups_type ON Groups_type.group_type_id = Groups.group_type_id JOIN Subject ON Subject.subject_id = Groups.subject_id JOIN Semesters ON Semesters.semester_id = Schedules.semester_id JOIN Direction ON Direction.direction_id = Schedules.direction_id;";

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
    return res.status(401).json({ ok: false, reason: "Invalid session key: "+req.body.key });
  }

  new mssql.Request().query("SELECT employee_account_id AS id, login, type_name AS account_type_name, Accounts_type.account_type_id AS account_type, first_name, last_name, Employees.employee_id FROM Employees_accounts LEFT JOIN Employees ON Employees_accounts.employee_id = Employees.employee_id JOIN Accounts_type ON Accounts_type.account_type_id = Employees_accounts.account_type_id", (err, result) => {
    if (err) {
      console.error("Error executing query: ", err);
      return res.status(500).json({ ok: false, reason: "Database error" });
    }
    console.log("Sending all users");
    return res.status(200).json({ ok: true, users: result.recordset });
  });
});

app.post("/profile/get-accounts-types", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key: "+req.body.key });
  }

  new mssql.Request().query("SELECT account_type_id AS id, type_name AS account_type FROM Accounts_type", (err, result) => {
    if (err) {
      console.error("Error executing query: ", err);
      return res.status(500).json({ ok: false, reason: "Database error" });
    }
    console.log("Sending all account types");
    return res.status(200).json({ ok: true, account_types: result.recordset });
  });
});

app.post("/profile/get", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }

  const id = req.body.user_id;
  if (id == null) {
    return res.status(400).json({ ok: false, reason: "No user id" });
  }

  new mssql.Request().query(
    "SELECT login, permission_level FROM Employees_accounts WHERE employee_account_id =" +
      id,
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

  const login = req.body.login;
  const password = req.body.password;
  const account_type = req.body.account_type;
  const employee_id = req.body.employee_id;
  if (
    login == null ||
    password == null ||
    account_type == null
  ) {
    return res
      .status(400)
      .json({ ok: false, reason: "No user id, login or pl" });
  }

  new mssql.Request().query(
    "INSERT INTO Employees_accounts (login, password, account_type_id, employee_id, permission_level) VALUES('" + login +
      "', '" + password +
      "', " + account_type +
      ", " + employee_id + 
      ", " + account_type + ")",
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

  const id = req.body.id;
  const login = req.body.login;
  const password = req.body.password;
  const account_type = req.body.account_type;
  const employee_id = req.body.employee_id;
  if (
    id == null ||
    login == null ||
    password == null ||
    account_type == null
  ) {
    return res
      .status(400)
      .json({ ok: false, reason: "No user id, login, password or account_type" });
  }

  new mssql.Request().query(
    "UPDATE Employees_accounts SET login = '" + login +
      "', password = '" + password +
      "', account_type_id = " + account_type +
      ", employee_id = " + employee_id +
      " WHERE employee_account_id =" + id,
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

  const id = req.body.id;
  if (id == null) {
    return res.status(400).json({ ok: false, reason: "No user id" });
  }

  new mssql.Request().query(
    "DELETE FROM Employees_accounts WHERE employee_account_id =" + id,
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

  new mssql.Request().query("SELECT employee_id AS id, first_name, last_name, position FROM Employees", (err, result) => {
    if (err) {
      console.error("Error executing query: ", err);
      return res.status(500).json({ ok: false, reason: "Database error" });
    }
    return res.status(200).json({ ok: true, employees: result.recordset });
  });
});

app.post("/employees/get-all-joinedname", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }

  new mssql.Request().query("SELECT employee_id AS id, first_name + ' ' + last_name AS name, position FROM Employees", (err, result) => {
    if (err) {
      console.error("Error executing query: ", err);
      return res.status(500).json({ ok: false, reason: "Database error" });
    }
    return res.status(200).json({ ok: true, employees: result.recordset });
  });
});

app.post("/employees/add", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }

  const first_name = req.body.first_name;
  const last_name = req.body.last_name;
  const position = req.body.position;
  if (
    first_name == null ||
    last_name == null ||
    position == null
  ) {
    return res
      .status(400)
      .json({ ok: false, reason: "No first_name, last_name or position" });
  }

  new mssql.Request().query(
    "INSERT INTO Employees (first_name, last_name, position) VALUES('" + first_name +
      "', '" + last_name +
      "', '" + position + "')",
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

  new mssql.Request().query(
    "UPDATE Employees SET first_name = '" + first_name +
      "', last_name = '" + last_name +
      "', position = '" + position +
      "' WHERE employee_id =" + id,
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

  const id = req.body.id;
  if (id == null) {
    return res.status(400).json({ ok: false, reason: "No id" });
  }

  new mssql.Request().query(
    "DELETE FROM Employees WHERE employee_id =" + id,
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

  new mssql.Request().query("SELECT account_type_id AS id, type_name AS account_type_name FROM Accounts_type", (err, result) => {
    if (err) {
      console.error("Error executing query: ", err);
      return res.status(500).json({ ok: false, reason: "Database error" });
    }
    return res.status(200).json({ ok: true, account_types: result.recordset });
  });
});

app.post("/user-types/add", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }

  const account_type_name = req.body.account_type_name;
  if (
    account_type_name == null
  ) {
    return res
      .status(400)
      .json({ ok: false, reason: "No account_type_name" });
  }

  new mssql.Request().query(
    "INSERT INTO Accounts_type (type_name) VALUES('" + account_type_name + "')",
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

  const id = req.body.id;
  const account_type_name = req.body.account_type_name;
  if (
    id == null ||
    account_type_name == null
  ) {
    return res
      .status(400)
      .json({ ok: false, reason: "No id or account_type_name" });
  }

  new mssql.Request().query(
    "UPDATE Accounts_type SET type_name = '" + account_type_name +
      "' WHERE account_type_id =" + id,
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

  const id = req.body.id;
  if (id == null) {
    return res.status(400).json({ ok: false, reason: "No id" });
  }

  new mssql.Request().query(
    "DELETE FROM Accounts_type WHERE account_type_id =" + id,
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

  new mssql.Request().query("SELECT direction_id, direction_name FROM Direction", (err, result) => {
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
  const direction_name = req.body.direction_name;
  if (
    direction_name == null
  ) {
    return res
      .status(400)
      .json({ ok: false, reason: "No direction_name" });
  }
  new mssql.Request().query(
    "INSERT INTO Direction (direction_name) VALUES('" + direction_name + "')",
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
  const id = req.body.id;
  const direction_name = req.body.direction_name;
  if (
    id == null ||
    direction_name == null
  ) {
    return res
      .status(400)
      .json({ ok: false, reason: "No id or direction_name" });
  }
  new mssql.Request().query(
    "UPDATE Direction SET direction_name = '" + direction_name +
      "' WHERE direction_id =" + id,
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
  const id = req.body.id;
  if (id == null) {
    return res.status(400).json({ ok: false, reason: "No id" });
  }
  new mssql.Request().query(
    "DELETE FROM Direction WHERE direction_id =" + id,
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
  new mssql.Request().query("SELECT * FROM Direction_Specialization", (err, result) => {
    if (err) {
      console.error("Error executing query: ", err);
      return res.status(500).json({ ok: false, reason: "Database error" });
    }
    return res.status(200).json({ ok: true, specializations: result.recordset });
  });
});

app.post("/specializations/add", (req, res) => {
  if (validateAPIKey(req.body.key)) {
    return res.status(401).json({ ok: false, reason: "Invalid session key" });
  }
  const specialization_name = req.body.specialization_name;
  const direction_id = req.body.direction_id;
  if (
    specialization_name == null ||
    direction_id == null
  ) {
    return res
      .status(400)
      .json({ ok: false, reason: "No specialization_name" });
  }
  new mssql.Request().query(
    "INSERT INTO Direction_Specialization (specialization_name, direction_id) VALUES('" + specialization_name + "', " + direction_id + ")",
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
  const id = req.body.id;
  const specialization_name = req.body.specialization_name;
  const direction_id = req.body.direction_id;
  if (
    id == null ||
    specialization_name == null ||
    direction_id == null
  ) {
    return res
      .status(400)
      .json({ ok: false, reason: "No id or specialization_name" });
  }
  new mssql.Request().query(
    "UPDATE Direction_Specialization SET specialization_name = '" + specialization_name + "', direction_id = " + direction_id +
      " WHERE direction_specialization_id = " + id,
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
  const id = req.body.id;
  if (id == null) {
    return res.status(400).json({ ok: false, reason: "No id" });
  }
  new mssql.Request().query(
    "DELETE FROM Direction_Specialization WHERE direction_specialization_id =" + id,
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
  const state_name = req.body.state_name;
  if (
    state_name == null
  ) {
    return res
      .status(400)
      .json({ ok: false, reason: "No state_name" });
  }
  new mssql.Request().query(
    "INSERT INTO Classes_state (state_name) VALUES('" + state_name + "')",
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
  const id = req.body.id;
  const state_name = req.body.state_name;
  if (
    id == null ||
    state_name == null
  ) {
    return res
      .status(400)
      .json({ ok: false, reason: "No id or state_name" });
  }
  new mssql.Request().query(
    "UPDATE Classes_state SET state_name = '" + state_name +
      "' WHERE class_state_id =" + id,
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
  const id = req.body.id;
  if (id == null) {
    return res.status(400).json({ ok: false, reason: "No id" });
  }
  new mssql.Request().query(
    "DELETE FROM Classes_state WHERE class_state_id =" + id,
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


//START SERWERA
app.listen(port, function () {
  console.log("Server is listening at port " + port + "...");
});

const server = https.createServer(httpsOptions, app)
    .listen(443, () => {
        console.log('https server running at ' + 443)
    });

/**
 *  Checks if string matches api_key
 * @param key key to validate
 * @returns true if key matches api_key
 */
function validateAPIKey(key) {

  console.dir(logged_users_uuids);
  key = key.replace(/"/g, "");

  //if (!key || !logged_users_uuids.includes(key)) {
  if (!key || key != api_key) {
    console.error("Wrong API key: " + key);
    return true;
  }
  return false;
}
