
let aktuelleFrage = 1;

function ladeFrage() {
  db.collection("umfragen").doc("aktuell").get().then(doc => {
    if (doc.exists) {
      aktuelleFrage = doc.data().aktuelleFrage || 1;
      document.getElementById("weinName").innerText = "Wein Nr. " + aktuelleFrage;
      ladeAntworten();
    }
  });
}

function ladeAntworten() {
  const frage = "frage_" + aktuelleFrage;
  db.collection("antworten").where("frage", "==", frage).get().then(snapshot => {
    const daten = [];
    snapshot.forEach(doc => daten.push(doc.data().wert));

    if (daten.length === 0) {
      document.getElementById("avgWert").innerText = "Noch keine Antworten.";
      zeichneChart([]);
      return;
    }

    const avg = daten.reduce((a, b) => a + b) / daten.length;
    document.getElementById("avgWert").innerText = "Durchschnitt: " + avg.toFixed(2);
    zeichneChart(daten);
  });
}

function zeichneChart(daten) {
  const verteilung = Array(51).fill(0);
  daten.forEach(wert => {
    const index = Math.round(wert * 10);
    verteilung[index]++;
  });

  const labels = Array.from({ length: 51 }, (_, i) => (i / 10).toFixed(1));
  const ctx = document.getElementById("distributionChart").getContext("2d");

  if (window.chartObj) window.chartObj.destroy();

  window.chartObj = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Anzahl Stimmen',
        data: verteilung,
        backgroundColor: '#8b0000'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true },
        x: { title: { display: true, text: 'Skala 0.0 - 5.0' } }
      }
    }
  });
}

document.getElementById("nextButton").addEventListener("click", () => {
  aktuelleFrage++;
  db.collection("umfragen").doc("aktuell").set({ aktuelleFrage });
  ladeFrage();
});

document.getElementById("resetButton").addEventListener("click", () => {
  if (!confirm("Willst du wirklich alle Antworten löschen?")) return;

  db.collection("antworten").get().then(snapshot => {
    const batch = db.batch();
    snapshot.forEach(doc => batch.delete(doc.ref));
    return batch.commit();
  }).then(() => {
    alert("Antworten gelöscht.");
    ladeAntworten();
  });
});

ladeFrage();
