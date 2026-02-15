const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: '*', // autorise toutes les origines
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

const champions = require('./data/champions.json');

const PORT = process.env.PORT || 3000;

const api = express.Router();

// constantes
const roles = {
  1: "top",
  2: "jungle",
  3: "mid",
  4: "adc",
  5: "support"
};

// Functions
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

api.get('/roles', function(req,res){
    res.json(roles);
})

// Endpoints 
// app.get('/fullRandom')

api.get('/numero', function (req, res) {
    const randomNumber = getRandomInt(169) + 1;
    res.json({ number: randomNumber });
})

api.get('/randomRole', function(req,res){
    const randomNumber = getRandomInt(5) + 1;
    res.json(roles[randomNumber]);
})

api.get('/championsByRole', (req, res) => {
  const role = (req.query.role || '').toString().trim().toLowerCase();

  if (!role) {
    return res.status(400).json({ error: 'Query param "role" is required (ex: ?role=mid).' });
  }

  // champions est supposé être un objet: { "Ahri": ["mid"], "Garen": ["top"], ... }
  const matchingChampions = Object.entries(champions)
    .filter(([_, roles]) => Array.isArray(roles) && roles.map(r => String(r).toLowerCase()).includes(role))
    .map(([name, roles]) => ({ name, roles }));

  if (matchingChampions.length === 0) {
    return res.status(404).json({ error: `Aucun champion trouvé pour le rôle "${role}"` });
  }

  return res.json({
    role,
    count: matchingChampions.length,
    champions: matchingChampions
  });
});

api.get('/randomChampion', function (req, res) {
    const role = req.query.role;

    // Si aucun rôle n'est précisé, renvoyer un champion aléatoire
    if (!role) {
        const championNames = Object.keys(champions);
        const randomIndex = getRandomInt(championNames.length);
        const name = championNames[randomIndex];
        return res.json({ name, roles: champions[name] });
    }

    // Sinon, filtrer les champions ayant ce rôle
    const matchingChampions = Object.entries(champions).filter(([_, roles]) =>
        roles.includes(role)
    );

    if (matchingChampions.length === 0) {
        return res.status(404).json({ error: `Aucun champion trouvé pour le rôle "${role}"` });
    }

    const [name, roles] = matchingChampions[getRandomInt(matchingChampions.length)];
    res.json({ name, roles });
});

api.get('/champions', function (req, res) {
    const result = champions;

    res.json(result);
});

// Liste tags	
// Fighter	59
// Mage	75
// Assassin	45
// Marksman	32
// Tank	45
// Support	43
api.get('/tags', function (req, res) {
    const tagCounts = {};

    Object.values(champions.data).forEach(champion => {
        champion.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
    });

    res.json(tagCounts);
});

// ajouter le '/api' pour express
app.use('/api', api);

app.listen(PORT, () => {
    console.log("Server Listening on PORT:", PORT);
});