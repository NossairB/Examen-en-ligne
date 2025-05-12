const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  enonce: { type: String, required: true }, // L'énoncé de la question
  type: { type: String, enum: ['qcm', 'directe'], required: true }, // "qcm" ou "directe"  // Type de question
  options: [String], // seulement pour QCM
  reponsesCorrectes: [String], // 1 ou plusieurs
  note: { type: Number, required: true },
  duree: { type: Number, required: true } // en secondes
});

module.exports = mongoose.model('Question', questionSchema);