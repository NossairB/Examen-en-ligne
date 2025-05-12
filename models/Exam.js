const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  questions: [
    {
      questionText: { type: String, required: true },
      options: [
        { text: { type: String, required: true }, correct: { type: Boolean, required: true } }
      ],
      answer: { type: String, required: true }
    }
  ],
  duration: { type: Number, required: true }, // Durée en minutes
  createdAt: { type: Date, default: Date.now }
});

const Exam = mongoose.model('Exam', examSchema);

module.exports = Exam;
