const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const Result = require('./models/Result');
const User = require('./models/User');
const bcrypt = require('bcrypt');

// 🔐 Middleware de protection
function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
}

// 1. Connexion à MongoDB
mongoose.connect('mongodb+srv://ZaAaG:ZaaaG240@cluster0.ug6xu2k.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('✅ Connecté à MongoDB'))
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
    console.error('❌ Erreur inscription :', error);
    res.status(400).json({ error: 'Erreur lors de l’inscription', details: error.message });
  }
});


app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.post('/login', async (req, res) => {
  const { email, motDePasse } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Utilisateur non trouvé" });
    }

    const match = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!match) {
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }

    // Connexion réussie → on stocke l'utilisateur en session
    req.session.userId = user._id;
    req.session.userRole = user.role;

    res.status(200).json({ message: "Connexion réussie !" });
  } catch (error) {
    console.error('❌ Erreur connexion :', error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ✅ Route déconnexion
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// ✅ Route protégée (dashboard par exemple)
app.get('/dashboard', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
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
