/* Importera npm-paket sqlite3 med hjälp av require() och lagrar i variabeln sqlite. Aktiverar även verbose-läge för mer detaljerade felmeddelanden. */
const sqlite = require("sqlite3").verbose();
/* Skapar en anslutning till den lokala SQLite-databasen. */
const db = new sqlite.Database("./gik339_old.db");

/* Importerar Express-ramverket.*/
const express = require("express");
/* Skapar en server Express-Serverinstans. */
const server = express();

/* Grundläggande middleware-konfiguration. */
server
  /* Tolkar inkommande JSON-data i request body. */
  .use(express.json())
  /* Tolkar URL-kodad data (t.ex. formulärdata). */
  .use(express.urlencoded({ extended: false }))
  /*  Middleware för att hantera CORS (tillåter anrop från andra origin).  */
  .use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // Tillåt alla origin
    res.header("Access-Control-Allow-Headers", "*"); // Tillåt alla headers
    res.header("Access-Control-Allow-Methods", "*"); // Tillåt alla HTTP-metoder
    next(); // Gå vidare till nästa middleware eller route
  });

/* Startar servern och lyssnar på port 3000. */
server.listen(3000, () => {
  /* Meddelande för feedback att servern körs */
  console.log("Server running on http://localhost:3000");
});

/* =========================
   ROUTES / ENDPOINTS
   ========================= */

/* GET /cars
   Hämtar alla bilar från databasen */
server.get("/cars", (req, res) => {
  const sql = "SELECT * FROM cars";

  /* Hämtar samtliga rader som matchar SQL-frågan */
  db.all(sql, (err, rows) => {
    /* Callbackfunktionen har parametern err för att lagra eventuella fel */
    if (err) {
      /* Skickar felkod 500 om något går fel vid databasanrop */
      res.status(500).send(err);
    } else {
      /* Annars, om allt gick bra, returnerar alla bilar som JSON.  */
      res.send(rows);
    }
  });
});

/* GET /cars/:id
   Hämtar en specifik bil baserat på id */
server.get("/cars/:id", (req, res) => {
  /* Hämtar id-parametern från URL:en */
  const id = req.params.id;

  const sql = `SELECT * FROM cars WHERE id=${id}`;

  /* Hämtar matchande rad från databasen */
  db.all(sql, (err, rows) => {
    if (err) {
      res.status(500).send(err);
    } else {
      /* Returnerar den första (och enda) matchande bilen */
      res.send(rows[0]);
    }
  });
});

/* POST /cars
   Lägger till en ny bil i databasen */
server.post("/cars", (req, res) => {
  /* Hämtar bilobjektet från request body */
  const car = req.body;
  const sql = `INSERT INTO cars(brand, model, year, color) VALUES (?,?,?,?)`;

  /* Värden som ska bindas till SQL-frågan */
  const values = [car.brand, car.model, car.year, car.color];

  /* Kör INSERT-frågan */
  db.run(sql, values, (err) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    } else {
      res.send("Bilen sparades");
    }
  });
});

/* PUT /cars
   Uppdaterar en befintlig bil */
server.put("/cars", (req, res) => {
  /* Hämtar data som skickats från klienten */
  const bodyData = req.body;

  /* ID för bilen som ska uppdateras */
  const id = bodyData.id;
  /* Objekt med uppdaterbara fält */
  const car = {
    brand: bodyData.brand,
    model: bodyData.model,
    year: bodyData.year,
    color: bodyData.color,
  };

  /* Bygger dynamiskt UPDATE-strängen */
  let updateString = "";
  const columnsArray = Object.keys(car);
  columnsArray.forEach((column, i) => {
    updateString += `${column}="${car[column]}"`;
    if (i !== columnsArray.length - 1) updateString += ",";
  });

  const sql = `UPDATE cars SET ${updateString} WHERE id=${id}`;

  /* Kör UPDATE-frågan */
  db.run(sql, (err) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    } else {
      res.send("Bilen uppdaterades");
    }
  });
});

/* DELETE /cars/:id
   Tar bort en bil baserat på id */
server.delete("/cars/:id", (req, res) => {
  /* Hämtar id från URL-parametern */
  const id = req.params.id;
  const sql = `DELETE FROM cars WHERE id = ${id}`;

  /* Kör DELETE-frågan */
  db.run(sql, (err) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    } else {
      res.send("Bilen borttagen");
    }
  });
});
