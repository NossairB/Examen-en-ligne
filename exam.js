const questions = [
  { question: "2 + 2", correctAnswer: "4" },
  { question: "5 - 1", correctAnswer: "4" },
  { question: "3 x 2", correctAnswer: "6" },
  { question: "10 / 2", correctAnswer: "5" }
];

let currentQuestion = 0;
let answers = [];
let score = 0;

function showQuestion() {
  const questionText = document.getElementById("question-text");
  questionText.textContent = questions[currentQuestion].question;
  document.getElementById("answer-input").value = "";
}

function submitAnswer() {
  const userAnswer = document.getElementById("answer-input").value;
  answers.push(userAnswer);

  if (userAnswer.trim() === questions[currentQuestion].correctAnswer) {
    score += 25; // 25 points par bonne réponse
  }

  currentQuestion++;

  if (currentQuestion < questions.length) {
    showQuestion();
  } else {
    document.getElementById("quiz").style.display = "none";
    document.getElementById("score-box").style.display = "block";
    document.getElementById("score").textContent = score;
    envoyerDonnees(answers);
  }
}

async function envoyerDonnees(answers) {
  const userId = 'user123';
  const scoreToSend = score;

  navigator.geolocation.getCurrentPosition(async (position) => {
    const geolocation = {
      lat: position.coords.latitude,
      lon: position.coords.longitude
    };

    const response = await fetch('/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId, answers, score: scoreToSend, geolocation })
    });

    
    const data = await response.json();
    alert(data.message);
  }, (error) => {
    console.error('Erreur de géolocalisation', error);
  });
}

window.onload = showQuestion;
