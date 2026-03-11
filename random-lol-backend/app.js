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
api.get("/numero", function (req, res) {
  const randomNumber = getRandomInt(169) + 1;
  res.json({ number: randomNumber });
});

api.get("/randomRole", function (req, res) {
  const randomNumber = getRandomInt(5) + 1;
  res.json(roles[randomNumber]);
});

api.get("/championsByRole", async (req, res) => {
  const role = (req.query.role || "").toString().trim().toLowerCase();

  if (!role) {
    return res.status(400).json({ error: 'Query param "role" is required (ex: ?role=mid).' });
  }

  try {
    const result = await pool.query("SELECT name, roles FROM champions WHERE $1 = ANY(roles)", [role]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Aucun champion trouvé pour le rôle "${role}"` });
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
api.post("/addChampion",async function (req,res){
    const name=
})

api.get("/randomChampion", async function (req, res) {
  const role = req.query.role;

  try {
    if (!role) {
      const result = await pool.query("SELECT name, roles FROM champions ORDER BY RANDOM() LIMIT 1");
      return res.json(result.rows[0]);
    }

    const result = await pool.query("SELECT name, roles FROM champions WHERE $1 = ANY(roles) ORDER BY RANDOM() LIMIT 1", [role]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Aucun champion trouvé pour le rôle "${role}"` });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

api.get('/champions', async function (req, res) {
    try {
      const result = await pool.query('SELECT name, roles FROM champions');
      const champions = result.rows.map(row => ({
        name: row.name,
        roles: Array.isArray(row.roles) ? row.roles : [], // Ensure it's an array
      }));
      res.json(champions);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
});

api.get("/tags", async function (req, res) {
  try {
    const result = await pool.query(`
        SELECT tag, COUNT(*) as count
        FROM champions, unnest(tags) as tag
        GROUP BY tag
      `);
    const tagCounts = result.rows.reduce((acc, row) => {
      acc[row.tag] = row.count;
      return acc;
    }, {});
    res.json(tagCounts);
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
