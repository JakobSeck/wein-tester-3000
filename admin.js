
const questions = Array.from({ length: 12 }, (_, i) => `Qualitätszahl Wein Nr.${i + 1}`);
let currentQuestionIndex = 0;
const chartCtx = document.getElementById("resultChart").getContext("2d");
let chart;

db.collection("state").doc("active").onSnapshot(doc => {
  currentQuestionIndex = doc.data()?.questionIndex || 0;
  renderChart();
});

function nextQuestion() {
  if (currentQuestionIndex < questions.length - 1) {
    db.collection("state").doc("active").set({ questionIndex: currentQuestionIndex + 1 });
  }
}
function prevQuestion() {
  if (currentQuestionIndex > 0) {
    db.collection("state").doc("active").set({ questionIndex: currentQuestionIndex - 1 });
  }
}
function resetVotes() {
  const qId = `q${currentQuestionIndex}`;
  db.collection("answers").doc(qId).collection("votes").get().then(snapshot => {
    const batch = db.batch();
    snapshot.forEach(doc => batch.delete(doc.ref));
    return batch.commit();
  }).then(renderChart);
}

function renderChart() {
  const qId = `q${currentQuestionIndex}`;
  db.collection("answers").doc(qId).collection("votes").get().then(snapshot => {
    const data = new Array(51).fill(0); // 0.0 to 5.0 in 0.1 steps
    snapshot.forEach(doc => {
      const val = Math.round(doc.data().value * 10);
      data[val]++;
    });

    const avg = snapshot.size ? (snapshot.docs.reduce((sum, d) => sum + d.data().value, 0) / snapshot.size).toFixed(2) : 0;

    if (chart) chart.destroy();
    chart = new Chart(chartCtx, {
      type: 'bar',
      data: {
        labels: Array.from({ length: 51 }, (_, i) => (i / 10).toFixed(1)),
        datasets: [{
          label: `Verteilung (Durchschnitt: ${avg})`,
          data: data,
          backgroundColor: "#8a2be2"
        }]
      },
      options: {
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  });
}
