const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Initialiser l'application Express
const app = express();

// Middleware pour gérer les données JSON envoyées dans le corps de la requête
app.use(bodyParser.json());

// Connexion à MongoDB
mongoose.connect('mongodb://localhost/exam-platform', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connexion à MongoDB réussie');
})
.catch(err => {
  console.error('Erreur de connexion à MongoDB', err);
});

// Définition du schéma pour l'examen
const examSchema = new mongoose.Schema({
  type: { type: String, required: true }, // Type de la question (directe ou QCM)
  statement: { type: String, required: true }, // L'énoncé de la question
  answer: { type: String }, // Réponse pour les questions directes
  tolerance: { type: Number }, // Tolérance pour les erreurs de frappe
  options: { type: [String] }, // Options pour les QCM
  correctAnswers: { type: [Number] }, // Indices des bonnes réponses pour les QCM
  note: { type: Number, required: true }, // Note pour la question
  duration: { type: Number, required: true }, // Durée de la question en secondes
  link: { type: String, required: true } // Lien vers l'examen
});

// Créer le modèle pour l'examen
const Exam = mongoose.model('Exam', examSchema);

// Route pour créer un nouvel examen
app.post('/api/exams', (req, res) => {
  const { type, statement, answer, tolerance, options, correctAnswers, note, duration, link } = req.body;

  // Créer un nouvel examen à partir des données reçues
  const newExam = new Exam({
    type,
    statement,
    answer,
    tolerance,
    options,
    correctAnswers,
    note,
    duration,
    link
  });

  // Enregistrer l'examen dans la base de données
  newExam.save()
    .then(exam => {
      res.status(201).json({ message: 'Examen créé avec succès', exam });
    })
    .catch(err => {
      res.status(500).json({ message: 'Erreur lors de la création de l’examen', error: err });
    });
});

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});