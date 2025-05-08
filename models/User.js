const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  nom: String,
  prenom: String,
  dateNaissance: Date,
  sexe: String,
  etablissement: String,
  filiere: String,
  motDePasse: { type: String, required: true },
  role: { type: String, enum: ['etudiant', 'enseignant'], required: true }
});

module.exports = mongoose.model('User', userSchema);
