DROP TABLE IF EXISTS cars;

CREATE TABLE IF NOT EXISTS cars (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  color TEXT NOT NULL
);

-- Exempeldata (OBS: skriv INTE id här när AUTOINCREMENT används)
INSERT INTO cars (brand, model, year, color) VALUES ('Volvo', 'V60', 2020, 'blue');
INSERT INTO cars (brand, model, year, color) VALUES ('BMW', '320i', 2018, 'black');
INSERT INTO cars (brand, model, year, color) VALUES ('Audi', 'A4', 2016, 'red');
INSERT INTO cars (brand, model, year, color) VALUES ('Toyota', 'Corolla', 2019, 'green');

SELECT * FROM cars;
