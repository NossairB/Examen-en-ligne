const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const Result = require('./models/Result');
const User = require('./models/User');
const bcrypt = require('bcrypt');


// 1. Connexion à MongoDB
mongoose.connect('mongodb://localhost:27017/quiz-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ Connecté à MongoDB'))
  .catch(err => console.error('❌ Erreur de connexion MongoDB:', err));


// 2. Middleware pour gérer les fichiers statiques (HTML, CSS, JS)
app.use(express.static(__dirname)); // Sert les fichiers HTML/CSS/JS
app.use(express.json()); // pour lire le JSON dans les requêtes POST
app.use(session({
    secret: 'monSecret',
    resave: false,
    saveUninitialized: true
}));

// 3. Routes pour gérer les requêtes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'register.html'));
});

app.post('/register', async (req, res) => {
  const { email, nom, prenom, dateNaissance, sexe, etablissement, filiere, motDePasse, role } = req.body;

  const hashedPassword = await bcrypt.hash(motDePasse, 10);

  try {
    const user = new User({
      email,
      nom,
      prenom,
      dateNaissance,
      sexe,
      etablissement,
      filiere,
      motDePasse: hashedPassword,
      role
    });

    await user.save();
    res.status(201).json({ message: 'Inscription réussie' });
  } catch (error) {
    res.status(400).json({ error: 'Erreur lors de l’inscription', details: error.message });
  }
});


app.post('/submit', async (req, res) => {
  try {
    const { userId, answers, score, geolocation } = req.body;

    const newResult = new Result({
      userId,
      answers,
      score,
      geolocation
    });

    await newResult.save();
    res.status(200).json({ message: 'Résultat enregistré avec succès !' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de l’enregistrement.' });
  }
});


// 4. Lancement du serveur
app.listen(3000, () => {
  console.log('Serveur démarré sur http://localhost:3000');
});
