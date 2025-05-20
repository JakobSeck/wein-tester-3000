
const userId = localStorage.getItem("userId") || Math.random().toString(36).substring(2);
localStorage.setItem("userId", userId);

const questions = Array.from({ length: 12 }, (_, i) => `Qualitätszahl Wein Nr.${i + 1}`);
let currentQuestionIndex = 0;

const questionContainer = document.getElementById("question-container");

db.collection("state").doc("active").onSnapshot(doc => {
  currentQuestionIndex = doc.data()?.questionIndex || 0;
  loadQuestion();
});

function loadQuestion() {
  const q = questions[currentQuestionIndex];
  const qId = `q${currentQuestionIndex}`;

  db.collection("answers").doc(qId).collection("votes").doc(userId).get().then(docSnap => {
    const alreadyVoted = docSnap.exists;

    questionContainer.innerHTML = `
      <h2>${q}</h2>
      ${alreadyVoted ? "<p>Du hast bereits abgestimmt.</p>" : `
        <div class="slider-container">
          <input type="range" id="slider" min="0" max="5" step="0.1" value="2.5"/>
          <p>Wert: <span id="sliderValue">2.5</span></p>
          <button onclick="submitVote()">Abstimmen</button>
        </div>
      `}
    `;

    if (!alreadyVoted) {
      const slider = document.getElementById("slider");
      slider.oninput = () => {
        document.getElementById("sliderValue").textContent = slider.value;
      };
    }
  });
}

function submitVote() {
  const value = parseFloat(document.getElementById("slider").value);
  const qId = `q${currentQuestionIndex}`;
  db.collection("answers").doc(qId).collection("votes").doc(userId).set({ value }).then(loadQuestion);
}
