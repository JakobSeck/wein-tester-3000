const questionTitle = document.getElementById("question-title");
const slider = document.getElementById("slider");
const valueDisplay = document.getElementById("value");
const submitBtn = document.getElementById("submitBtn");

slider.addEventListener("input", () => {
  valueDisplay.textContent = slider.value;
});

db.collection("activeQuestion").doc("current").onSnapshot(doc => {
  const data = doc.data();
  if (data && data.question) {
    questionTitle.textContent = data.question;
  }
});

submitBtn.addEventListener("click", () => {
  const score = parseFloat(slider.value);
  const question = questionTitle.textContent;
  db.collection("answers").add({
    question,
    score,
    timestamp: Date.now()
  }).then(() => {
    alert("Antwort gesendet!");
  });
});