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

  new mssql.Request().query("SELECT employee_account_id AS id, login, type_name AS account_type_name, Accounts_type.account_type_id AS account_type, first_name, last_name, Employees.employee_id FROM Employees_accounts JOIN Employees ON Employees_accounts.employee_id = Employees.employee_id JOIN Accounts_type ON Accounts_type.account_type_id = Employees_accounts.account_type_id", (err, result) => {
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
app.post("/employees", (req, res) => {
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

//CRUD ROOMS
app.get("/rooms", (req, res) => {
  new mssql.Request().query("SELECT * FROM Rooms", (err, result) => {
    if (err) {
      console.error("Error executing query: ", err);
      return res.status(500).json({ ok: false, reason: "Database error" });
    }
    return res.status(200).json({ ok: true, rooms: result.recordset });
  });
});

app.post("/rooms", (req, res) => {
  const { room_number, department_id } = req.body;

  if (!room_number || !department_id) {
    return res
      .status(400)
      .json({ ok: false, reason: "Missing room_number or department_id" });
  }

  const query =
    "INSERT INTO Rooms (room_number, department_id) VALUES (@room_number, @department_id)";
  const request = new mssql.Request();
  request.input("room_number", mssql.VarChar, room_number);
  request.input("department_id", mssql.Int, department_id);

  request.query(query, (err) => {
    if (err) {
      console.error("Error executing query: ", err);
      return res.status(500).json({ ok: false, reason: "Database error" });
    }
    return res
      .status(201)
      .json({ ok: true, message: "Room added successfully" });
  });
});

app.put("/rooms/:id", (req, res) => {
  const room_id = req.params.id;
  const { room_number, department_id } = req.body;

  if (!room_number || !department_id) {
    return res
      .status(400)
      .json({ ok: false, reason: "Missing room_number or department_id" });
  }

  const query =
    "UPDATE Rooms SET room_number = @room_number, department_id = @department_id WHERE room_id = @room_id";
  const request = new mssql.Request();
  request.input("room_id", mssql.Int, room_id);
  request.input("room_number", mssql.VarChar, room_number);
  request.input("department_id", mssql.Int, department_id);

  request.query(query, (err, result) => {
    if (err) {
      console.error("Error executing query: ", err);
      return res.status(500).json({ ok: false, reason: "Database error" });
    }
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ ok: false, reason: "Room not found" });
    }
    return res
      .status(200)
      .json({ ok: true, message: "Room updated successfully" });
  });
});

app.delete("/rooms/:id", (req, res) => {
  const room_id = req.params.id;

  const query = "DELETE FROM Rooms WHERE room_id = @room_id";
  const request = new mssql.Request();
  request.input("room_id", mssql.Int, room_id);

  request.query(query, (err, result) => {
    if (err) {
      console.error("Error executing query: ", err);
      return res.status(500).json({ ok: false, reason: "Database error" });
    }
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ ok: false, reason: "Room not found" });
    }
    return res
      .status(200)
      .json({ ok: true, message: "Room deleted successfully" });
  });
});

// OBSŁUGA DEPARTMENT

app.get("/departments", async (req, res) => {
  try {
    const pool = await mssql.connect(sqlconfig);
    const result = await pool.request().query(`
        SELECT d.department_id, d.name, d.open_time, d.close_time, 
              a.street, a.phone_number
        FROM Department d
        LEFT JOIN Department_address a ON d.department_address_id = a.department_address_id
      `);

    // Grupowanie danych na poziomie backendu
    const departments = {};
    result.recordset.forEach((row) => {
      if (!departments[row.department_id]) {
        departments[row.department_id] = {
          department_id: row.department_id,
          name: row.name,
          open_time: row.open_time,
          close_time: row.close_time,
          address: { street: row.street },
          phones: [],
        };
      }
      if (row.phone_number) {
        departments[row.department_id].phones.push({
          phone_number: row.phone_number,
        });
      }
    });

    res.status(200).json({ ok: true, departments: Object.values(departments) });
  } catch (err) {
    console.error("Error fetching departments: ", err);
    res.status(500).json({ ok: false, reason: "Database error" });
  }
});

// Endpoint: Dodaj nowy departament
app.post("/departments", async (req, res) => {
  const { name, open_time, close_time, address, phones } = req.body;

  if (!name || !open_time || !close_time || !address?.street) {
    return res
      .status(400)
      .json({ ok: false, reason: "Missing required fields" });
  }

  try {
    const pool = await mssql.connect(sqlconfig);

    // Dodaj departament
    const insertDepartment = await pool
      .request()
      .input("name", mssql.VarChar, name)
      .input("open_time", mssql.Time, open_time)
      .input("close_time", mssql.Time, close_time)
      .query(
        "INSERT INTO Department (name, open_time, close_time) OUTPUT INSERTED.department_id VALUES (@name, @open_time, @close_time)"
      );

    const department_id = insertDepartment.recordset[0].department_id;

    // Dodaj adres
    const insertAddress = await pool
      .request()
      .input("department_id", mssql.Int, department_id)
      .input("street", mssql.VarChar, address.street)
      .input("phone", mssql.VarChar, phones.phone_number)
      .query(
        "INSERT INTO Department_address (department_id, street) OUTPUT INSERTED.department_address_id VALUES (@department_id, @street, @phone)"
      );

    res.status(201).json({ ok: true });
  } catch (err) {
    console.error("Error creating department: ", err);
    res.status(500).json({ ok: false, reason: "Database error" });
  }
});

// Endpoint: Zaktualizuj istniejący departament
app.put("/departments/:id", async (req, res) => {
  const department_id = req.params.id;
  const { name, open_time, close_time, address, phones } = req.body;

  if (!name || !open_time || !close_time || !address?.street) {
    return res
      .status(400)
      .json({ ok: false, reason: "Missing required fields" });
  }

  try {
    const pool = await mssql.connect(sqlconfig);

    // Aktualizuj departament
    await pool
      .request()
      .input("department_id", mssql.Int, department_id)
      .input("name", mssql.VarChar, name)
      .input("open_time", mssql.Time, open_time)
      .input("close_time", mssql.Time, close_time)
      .query(
        "UPDATE Department SET name = @name, open_time = @open_time, close_time = @close_time WHERE department_id = @department_id"
      );

    // Aktualizuj adres
    await pool
      .request()
      .input("department_id", mssql.Int, department_id)
      .input("street", mssql.VarChar, address.street)
      .input("phone", mssql.VarChar, phones.phone_number)
      .query(
        "UPDATE Department_address SET street = @street, phone_number = @phone WHERE department_id = @department_id"
      );

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Error updating department: ", err);
    res.status(500).json({ ok: false, reason: "Database error" });
  }
});

// Endpoint: Usuń departament
app.delete("/departments/:id", async (req, res) => {
  const department_id = req.params.id;

  try {
    const pool = await mssql.connect(sqlconfig);

    // Usuń adres
    await pool
      .request()
      .input("department_id", mssql.Int, department_id)
      .query(
        "DELETE FROM Department_address WHERE department_id = @department_id"
      );

    // Usuń departament
    await pool
      .request()
      .input("department_id", mssql.Int, department_id)
      .query("DELETE FROM Department WHERE department_id = @department_id");

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Error deleting department: ", err);
    res.status(500).json({ ok: false, reason: "Database error" });
  }
});

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

  //if (!key || !logged_users_uuids.includes(key)) {
  if (!key || key !== api_key) {
    console.error("Wrong API key: " + key);
    return false;
  }
  return true;
}
