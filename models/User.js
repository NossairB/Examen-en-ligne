const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  nom: String,
  prenom: String,
  dateNaissance: Date,
  sexe: String,
  etablissement: String,
  filiere: String,
  motDePasse: String,
  role: { type: String, enum: ['enseignant', 'etudiant'], required: true }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
