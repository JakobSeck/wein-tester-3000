const questions = Array.from({ length: 12 }, (_, i) => `Qualitätszahl Wein Nr.${i + 1}`);
const questionSelect = document.getElementById("questionSelect");
const setBtn = document.getElementById("setQuestionBtn");
const statsDiv = document.getElementById("stats");

questions.forEach(q => {
  const opt = document.createElement("option");
  opt.textContent = q;
  questionSelect.appendChild(opt);
});

setBtn.addEventListener("click", () => {
  const selected = questionSelect.value;
  db.collection("activeQuestion").doc("current").set({ question: selected });
  showStats(selected);
});

function showStats(question) {
  db.collection("answers").where("question", "==", question).get().then(snapshot => {
    const scores = snapshot.docs.map(doc => doc.data().score);
    const avg = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2);
    statsDiv.innerHTML = `<h3>Durchschnitt: ${avg}</h3>`;
  });
}