let questions = [];
let currentQuestion = 0;
let answers = [];
let score = 0;

// Charger les questions depuis le serveur
async function loadQuestions() {
  try {
    const response = await fetch('/questions');
    questions = await response.json();
    showQuestion(); // Affiche la première question
  } catch (error) {
    console.error('Erreur de récupération des questions', error);
    alert("Erreur lors du chargement des questions.");
  }
}

// Afficher la question actuelle
function showQuestion() {
  const questionText = document.getElementById("question-text");
  const inputField = document.getElementById("answer-input");
  const q = questions[currentQuestion];

  questionText.innerHTML = `<strong>Question ${currentQuestion + 1} :</strong> ${q.enonce}`;
  inputField.style.display = "none"; // Cacher le champ texte par défaut
  inputField.value = "";

  // Vider les anciennes options
  const optionsContainer = document.getElementById("options");
  optionsContainer.innerHTML = "";

  if (q.type === "qcm") {
    // Créer des boutons radio pour chaque option
    q.options.forEach(option => {
      const label = document.createElement("label");
      label.innerHTML = `
        <input type="radio" name="option" value="${option}"> ${option}
      `;
      optionsContainer.appendChild(label);
      optionsContainer.appendChild(document.createElement("br"));
    });
  } else {
    // Afficher le champ texte pour les questions ouvertes
    inputField.style.display = "block";
  }
}

// Soumettre une réponse
function submitAnswer() {
  const q = questions[currentQuestion];
  let userAnswer = "";

  if (q.type === "qcm") {
    const selected = document.querySelector('input[name="option"]:checked');
    if (!selected) {
      alert("Veuillez sélectionner une réponse.");
      return;
    }
    userAnswer = selected.value;
  } else {
    userAnswer = document.getElementById("answer-input").value.trim();
    if (!userAnswer) {
      alert("Veuillez entrer une réponse.");
      return;
    }
  }

  answers.push(userAnswer);

  const correctAnswer = q.reponsesCorrectes[0].toLowerCase();
  if (userAnswer.toLowerCase() === correctAnswer) {
    score += q.note;
  }

  currentQuestion++;

  if (currentQuestion < questions.length) {
    showQuestion();
  } else {
    endQuiz();
  }
}

// Terminer l'examen
function endQuiz() {
  document.getElementById("quiz").style.display = "none";
  document.getElementById("score-box").style.display = "block";
  document.getElementById("score").textContent = score;
  envoyerDonnees();
}

// Envoyer les données au serveur
async function envoyerDonnees() {
  const userId = 'user123'; // Remplacer par l'ID réel si disponible

  navigator.geolocation.getCurrentPosition(async (position) => {
    const geolocation = {
      lat: position.coords.latitude,
      lon: position.coords.longitude
    };

    const response = await fetch('/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, answers, score, geolocation })
    });

    const data = await response.json();
    alert(data.message);
  }, (error) => {
    console.error('Erreur de géolocalisation', error);
  });
}

// Charger les questions dès le chargement de la page
window.onload = loadQuestions;