let timerid = null
const card_duration = 30000; //30 seconds


function clearTimer(){
  if(timerid !== null){
    clearTimeout(timerid);
    timerid = null;
  }
}

function startTimer(){
  clearTimer();
  timerid = setTimeout(() => {
    if(currentIndex < flashcards.length - 1){
      currentIndex++;
      updateFlashcard();
      startTimer(); //start timer for next card
    }
  }, card_duration);
}


let flashcards = [];
let currentIndex = 0;

const flashSection = document.getElementById("flashcards-section");
const title = document.getElementById("flashcard-title");
const minuteText = document.getElementById("card-minute");
const contentText = document.getElementById("card-content");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");

// FORM SUBMIT → BACKEND CALL
document.getElementById("flashcardForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const topic = document.getElementById("topicInput").value.trim();
  if (!topic) return alert("Please enter a topic");
  title.innerText = `Learning: ${topic}`;
  try {
    const response = await fetch("/api/flashcards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic })
    });
    console.log("HTTP status:", response.status);
    const text = await response.text();
    console.log("Raw backend response:", text);
    const lines = text
      .split("\n")
      .map(line => line.trim())
      .filter(line => line !== "");

    flashcards = [];

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith("Q:") && lines[i + 1]?.startsWith("A:")) {
        flashcards.push({
          question: lines[i].replace("Q:", "").trim(),
          answer: lines[i + 1].replace("A:", "").trim()
        });
        i++; // skip next line since it's the answer
      }
    }

    if (flashcards.length === 0) {
      alert("Could not generate flashcards. Try again.");
      return;
    }
    currentIndex = 0;
    updateFlashcard();
    flashSection.classList.remove("hidden");
    flashSection.scrollIntoView({ behavior: "smooth" });
  } catch (err) {
    console.error("API error:", err);
    alert("Failed to load flashcards");
  }
});
function updateFlashcard() {
  minuteText.innerText = `Minute ${currentIndex + 1}`;

  contentText.innerHTML = `
    <strong>Q:</strong> ${flashcards[currentIndex].question}<br><br>
    <strong>A:</strong> ${flashcards[currentIndex].answer}
  `;
  prevBtn.disabled = currentIndex === 0;
  nextBtn.disabled = currentIndex === flashcards.length - 1;
  startTimer();
}
nextBtn.addEventListener("click", () => {
  if (currentIndex < flashcards.length - 1) {
    currentIndex++;
    updateFlashcard();
    startTimer();
  }
});

prevBtn.addEventListener("click", () => {
  if (currentIndex > 0) {
    currentIndex--;
    updateFlashcard();
    startTimer();
  }
});

document.getElementsByClassName("start_learn")[0].addEventListener("click", () => {
  document
    .getElementsByClassName("how-section")[0]
    .scrollIntoView({ behavior: "smooth" });
});

document.getElementsByClassName("learnin5-btn")[0].addEventListener("click", () => {
  document
    .getElementById("flashcardForm")
    .scrollIntoView({ behavior: "smooth" });
});