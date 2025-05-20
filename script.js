const questions = Array.from({ length: 12 }, (_, i) => `Qualitätszahl Wein Nr. ${i + 1}`);
let currentQuestion = 0;
let responses = new Array(questions.length).fill(2.5);
let surveyCode = "";

function startSurvey() {
  const input = document.getElementById("code-input").value.trim();
  if (/^\d{6}$/.test(input)) {
    surveyCode = input;
    document.getElementById("start-screen").style.display = "none";
    document.getElementById("survey-screen").style.display = "block";
    loadQuestion();
  } else {
    alert("Bitte gib einen gültigen 6-stelligen Zahlencode ein.");
  }
}

function loadQuestion() {
  document.getElementById("question-title").textContent = `Frage ${currentQuestion + 1}`;
  document.getElementById("question-text").textContent = questions[currentQuestion];
  document.getElementById("response-slider").value = responses[currentQuestion];
  updateLabel();
}

function updateLabel() {
  const value = document.getElementById("response-slider").value;
  document.getElementById("slider-value").textContent = value;
  responses[currentQuestion] = parseFloat(value);
}

function nextQuestion() {
  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
    loadQuestion();
  } else {
    alert("Danke für deine Teilnahme!\n(Daten werden derzeit nur lokal gespeichert)");
    location.reload();
  }
}

function prevQuestion() {
  if (currentQuestion > 0) {
    currentQuestion--;
    loadQuestion();
  }
}
