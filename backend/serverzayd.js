const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User'); // Le modèle User doit être défini dans un fichier séparé
const Exam = require('./models/Exam'); // Le modèle Exam doit être défini dans un fichier séparé

// Initialisation d'Express
const app = express();
const port = 3000;

// Connexion à MongoDB
mongoose.connect('mongodb+srv://zaydAG:zaydAG@cluster0.pnetqrw.mongodb.net/ExamenEnLigne?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('✅ Connecté à MongoDB'))
  .catch(err => console.error('❌ Erreur de connexion MongoDB:', err));

// Middleware pour parser les données POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Middleware pour gérer les sessions
app.use(session({
  secret: 'examen-secret', // Chaîne secrète pour sécuriser la session
  resave: false,
  saveUninitialized: true,
}));

// Dossier pour les fichiers statiques (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'frontend')));

// Middleware de protection pour vérifier si l'utilisateur est connecté
function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
}

// Routes pour la gestion des utilisateurs

// Page d'inscription
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'register.html'));
});

// Route pour l'inscription d'un utilisateur
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
    if (role === 'enseignant') {
      return res.status(201).json({ message: 'Inscription réussie', redirectUrl: '/create-exam.html' }); // Redirection vers la page de création d'examen
    }
    res.status(201).json({ message: 'Inscription réussie', redirectUrl: '/exam.html' }); // Redirection vers la page d'examen pour étudiant
  } catch (error) {
    console.error('❌ Erreur inscription :', error);
    res.status(400).json({ error: 'Erreur lors de l’inscription', details: error.message });
  }
});

// Page de connexion
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'login.html'));
});

// Route pour la connexion d'un utilisateur
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

    // Connexion réussie → stocke l'utilisateur en session
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
  res.sendFile(path.join(__dirname, 'frontend', 'dashboard.html'));
});

// Route pour soumettre un résultat d'examen
app.post('/submit', async (req, res) => {
  const { userId, answers, score, geolocation } = req.body;

  try {
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

// ----------------------------
// ✅ Route pour enregistrer un examen
// ----------------------------
app.post('/api/exams', async (req, res) => {
  const { title, description, questions, duration } = req.body;

  try {
    const newExam = new Exam({
      title,
      description,
      questions,
      duration
    });

    // Sauvegarder l'examen dans la base de données MongoDB
    await newExam.save();

    res.status(201).json({ message: 'Examen enregistré avec succès !', examId: newExam._id });
  } catch (error) {
    console.error('❌ Erreur lors de l\'enregistrement de l\'examen :', error);
    res.status(500).json({ message: 'Erreur lors de l\'enregistrement de l\'examen', error: error.message });
  }
});

// ----------------------------
// ✅ Route pour récupérer les examens depuis MongoDB
// ----------------------------
app.get('/api/exams', async (req, res) => {
  try {
    const exams = await Exam.find(); // Récupère tous les examens depuis MongoDB
    res.json(exams);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des examens :', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des examens', error: error.message });
  }
});

// 4. Lancement du serveur
app.listen(3000, () => {
  console.log('Serveur démarré sur http://localhost:3000');
});
