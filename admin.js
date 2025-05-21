// Firebase config (deine echten Werte hier einfügen)
const firebaseConfig = {
  apiKey: "AIzaSyASD7sd9H8zC4eWQG4hXhu7OlKZlZbgxTo",
  authDomain: "weintester-6e16b.firebaseapp.com",
  projectId: "weintester-6e16b",
  storageBucket: "weintester-6e16b.appspot.com",
  messagingSenderId: "246274264172",
  appId: "1:246274264172:web:c417c43f66d81d68fc1c49",
  measurementId: "G-6DG76XNGG8"
};

firebase.initializeApp(firebaseConfig);
const firestore = firebase.firestore();

const chartCanvas = document.getElementById("distributionChart");
const avgWert = document.getElementById("avgWert");
const weinName = document.getElementById("weinName");
const nextButton = document.getElementById("nextButton");
const resetButton = document.getElementById("resetButton");

let chart;
let aktuelleFrage = 1;

const frageNamen = Array.from({ length: 12 }, (_, i) => `Wein Nr. ${i + 1}`);

function ladeFrage(frageNummer) {
  const frage = `frage_${frageNummer}`;
  weinName.innerText = `Weinbeurteilung: ${frageNamen[frageNummer - 1]}`;

  firestore.collection("antworten").where("frage", "==", frage).get().then(snapshot => {
    const werte = snapshot.docs.map(doc => doc.data().wert);
    const verteilung = Array(51).fill(0);

    werte.forEach(wert => {
      const index = Math.round(wert * 10); // 0.1-Schritte
      verteilung[index]++;
    });

    const labels = Array.from({ length: 51 }, (_, i) => (i / 10).toFixed(1));
    const data = {
      labels: labels,
      datasets: [{
        label: "Stimmen",
        data: verteilung,
        backgroundColor: "#42a5f5"
      }]
    };

    const avg = werte.length > 0 ? (werte.reduce((a, b) => a + b) / werte.length).toFixed(2) : "0.00";
    avgWert.innerText = `Durchschnitt: ${avg}`;

    if (chart) chart.destroy();
    chart = new Chart(chartCanvas, {
      type: "bar",
      data: data,
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  });
}

// Aktuelle Frage beim Start laden
firestore.collection("umfragen").doc("aktuell").onSnapshot(doc => {
  aktuelleFrage = doc.data().aktuelleFrage;
  ladeFrage(aktuelleFrage);
});

// Button: Nächste Frage freigeben
nextButton.addEventListener("click", () => {
  firestore.collection("umfragen").doc("aktuell").update({
    aktuelleFrage: firebase.firestore.FieldValue.increment(1)
  });
});

// Button: Alle Antworten löschen
resetButton.addEventListener("click", () => {
  firestore.collection("antworten").get().then(snapshot => {
    const batch = firestore.batch();
    snapshot.forEach(doc => batch.delete(doc.ref));
    return batch.commit();
  }).then(() => {
    alert("Alle Antworten wurden gelöscht.");
    ladeFrage(aktuelleFrage);
  });
});
