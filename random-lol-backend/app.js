const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: "*", // autorise toutes les origines
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  }),
);
app.use(express.json());

const champions = require("./data/champions.json");

const PORT = process.env.PORT || 3000;

const api = express.Router();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// constantes
const roles = {
  1: "top",
  2: "jungle",
  3: "mid",
  4: "adc",
  5: "support",
};

// Functions
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

api.get("/roles", function (req, res) {
  res.json(roles);
});

// endpoints

// genere un chiffre de 1 a 5
api.get("/randomRole", function (req, res) {
  const randomNumber = getRandomInt(5) + 1;
  res.json(roles[randomNumber]);
});

// recupere la liste des champion en passant en parametre un role
api.get("/championsByRole", async (req, res) => {
  const role = (req.query.role || "").toString().trim().toLowerCase();

  if (!role) {
    return res.status(400).json({ error: "Rôle non defini dans les parametres." });
  }

  try {
    const result = await pool.query("SELECT name, roles FROM champions WHERE $1 = ANY(roles)", [role]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Aucun champion ne correspond au rôle : "${role}"` });
    }

    return res.json({
      role,
      count: result.rows.length,
      champions: result.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

//add champion
api.post("/addChampion", async (req, res) => {
  const { name, roles } = req.body;

  if (!name || !roles) {
    return res.status(400).json({ error: "Name and roles are required." });
  }

  try {
    const result = await pool.query("INSERT INTO champions (name, roles) VALUES ($1, $2) RETURNING *", [name, roles]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// update les roles d'un champion
api.put("/modifyRoles/:name/roles", async (req, res) => {
  const { name } = req.params;
  const { roles } = req.body;

  console.log('name : ', name, ' roles : ', roles);

  if (!roles) {
    return res.status(400).json({ error: "Roles are required." });
  }

  try {
    const result = await pool.query("UPDATE champions SET roles = $1 WHERE name = $2 RETURNING *", [roles, name]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Champion "${name}" not found.` });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// champion aleatoire (avec possibilité de passé en parametre un role)
api.get("/randomChampion", async function (req, res) {
  const roles = req.query.role;

  // console.log('roles:', roles);

  try {
    // Si pas de role selectionner alors just full aleatoire
    if (!roles) {
      const result = await pool.query("SELECT name, roles FROM champions ORDER BY RANDOM() LIMIT 1");
      return res.json(result.rows[0]);
    }

    // convertie le string en un array 
    const rolesArray = Array.isArray(roles) ? roles : roles.split(',');

    // Use ANY with an array of roles
    const result = await pool.query(
      "SELECT name, roles FROM champions WHERE roles && $1::text[] ORDER BY RANDOM() LIMIT 1",
      [rolesArray]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Aucun champion trouvé pour les rôles "${rolesArray.join(', ')}"` });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

api.get("/champions", async function (req, res) {
  try {
    const result = await pool.query("SELECT name, roles FROM champions");
    const champions = result.rows.map((row) => ({
      name: row.name,
      roles: Array.isArray(row.roles) ? row.roles : [], // Ensure it's an array
    }));
    res.json(champions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ajouter le '/api' pour express
app.use("/api", api);

app.listen(PORT, () => {
  console.log("Server Listening on PORT:", PORT);
});
