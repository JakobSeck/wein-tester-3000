const db = firebase.firestore();
let currentCode = "";

function loadSession() {
  currentCode = document.getElementById("code").value.trim();
  if (!/^\d{6}$/.test(currentCode)) {
    alert("Ungültiger Code");
    return;
  }
  document.getElementById("admin-panel").style.display = "block";

  const select = document.getElementById("question-select");
  select.innerHTML = "";
  for (let i = 1; i <= 12; i++) {
    const option = document.createElement("option");
    option.value = i - 1;
    option.textContent = `Frage ${i}`;
    select.appendChild(option);
  }

  loadAnswers();
}

function setCurrentQuestion() {
  const q = parseInt(document.getElementById("question-select").value);
  db.collection("sessions").doc(currentCode).set({ currentQuestion: q }, { merge: true });
}

function loadAnswers() {
  db.collection("sessions").doc(currentCode)
    .collection("responses")
    .get()
    .then(snapshot => {
      let html = "";
      const data = Array(12).fill().map(() => []);
      snapshot.forEach(doc => {
        const res = doc.data();
        res.answers.forEach((val, idx) => {
          data[idx].push(val);
        });
      });
      data.forEach((arr, i) => {
        const avg = arr.reduce((a,b)=>a+b,0) / arr.length || 0;
        html += `<p>Frage ${i+1}: Ø ${avg.toFixed(2)} (${arr.length} Antworten)</p>`;
      });
      document.getElementById("results").innerHTML = html;
    });
}
