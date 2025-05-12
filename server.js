const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Sert les fichiers HTML

let exams = [];
const examsFile = './exams.json';

// Charger les examens depuis un fichier si existant
if (fs.existsSync(examsFile)) {
  exams = JSON.parse(fs.readFileSync(examsFile, 'utf8'));
}

app.post('/api/exams', (req, res) => {
  const exam = { ...req.body, id: exams.length + 1 };
  exams.push(exam);
  fs.writeFileSync(examsFile, JSON.stringify(exams, null, 2));
  res.json({ id: exam.id });
});

app.get('/api/exams/:id', (req, res) => {
  const exam = exams.find(e => e.id === parseInt(req.params.id));
  if (exam) {
    res.json(exam);
  } else {
    res.status(404).json({ error: 'Examen non trouvé' });
  }
});




// Route pour la connexion
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  console.log('Email:', email);
  console.log('Mot de passe:', password);
  // Logique de connexion ici...
  res.json({ success: true });
});

// Route pour l'inscription
app.post('/register', (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  console.log('Prénom:', firstName);
  console.log('Nom:', lastName);
  console.log('Email:', email);
  console.log('Mot de passe:', password);
  // Logique d'inscription ici...
  res.json({ success: true });
});




app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
