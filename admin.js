// Firebase config – DEINE Daten hier einsetzen
const firebaseConfig = {
  apiKey: "DEIN_API_KEY",
  authDomain: "DEIN_AUTH_DOMAIN",
  projectId: "DEIN_PROJECT_ID",
  storageBucket: "DEIN_STORAGE_BUCKET",
  messagingSenderId: "DEIN_SENDER_ID",
  appId: "DEINE_APP_ID"
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
    const werte = snapshot.docs.map(doc => doc.data().wert).filter(w => typeof w === 'number');
    const verteilung = Array(51).fill(0);

    werte.forEach(wert => {
      const index = Math.round(wert * 10); // 0.1-Schritte
      if (index >= 0 && index <= 50) verteilung[index]++;
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
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }).catch(err => {
    console.error("Fehler beim Laden der Frage:", err);
    avgWert.innerText = "Fehler beim Laden der Daten";
  });
}

// Initial: aktuelle Frage auslesen
firestore.collection("umfragen").doc("aktuell").onSnapshot(doc => {
  if (doc.exists) {
    aktuelleFrage = doc.data().aktuelleFrage || 1;
    ladeFrage(aktuelleFrage);
  } else {
    console.error("Dokument 'aktuell' existiert nicht.");
    avgWert.innerText = "Konfigurationsfehler!";
  }
});

// Nächste Frage freigeben
nextButton.addEventListener("click", () => {
  firestore.collection("umfragen").doc("aktuell").update({
    aktuelleFrage: firebase.firestore.FieldValue.increment(1)
  }).then(() => {
    console.log("Nächste Frage freigegeben");
  }).catch(err => {
    console.error("Fehler beim Freigeben:", err);
    alert("Fehler beim Freigeben. Rechte? Dokument 'aktuell' da?");
  });
});

// Antworten zurücksetzen
resetButton.addEventListener("click", () => {
  firestore.collection("antworten").get().then(snapshot => {
    const batch = firestore.batch();
    snapshot.forEach(doc => batch.delete(doc.ref));
    return batch.commit();
  }).then(() => {
    alert("Alle Antworten gelöscht.");
    ladeFrage(aktuelleFrage);
  });
});
