 
document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.querySelector(".learnin5-btn");
  const learnSection = document.getElementById("learn-section");

  startBtn.addEventListener("click", () => {
    learnSection.scrollIntoView({ behavior: "smooth" });
  });
});
const learnBtn = document.getElementById("learnBtn");
const input = document.getElementById("topicInput");

const flashSection = document.getElementById("flashcards-section");
const title = document.getElementById("flashcard-title");
const minuteText = document.getElementById("card-minute");
const contentText = document.getElementById("card-content");

const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");

// Temporary dummy data (later replace with backend)
let flashcards = [];
let currentIndex = 0;

learnBtn.addEventListener("click", () => {
  const topic = input.value.trim();
  if (!topic) return alert("Enter a topic");

  title.innerText = `Learning: ${topic}`;

  // Dummy flashcards (backend will replace this)
  flashcards = [
    `What is ${topic}?`,
    `Why do we use ${topic}?`,
    `Simple example of ${topic}`,
    `Common mistakes in ${topic}`,
    `Quick summary of ${topic}`
  ];

  currentIndex = 0;
  updateFlashcard();

  flashSection.classList.remove("hidden");
  flashSection.scrollIntoView({ behavior: "smooth" });
});

function updateFlashcard() {
  minuteText.innerText = `Minute ${currentIndex + 1}`;
  contentText.innerText = flashcards[currentIndex];
}

nextBtn.addEventListener("click", () => {
  if (currentIndex < flashcards.length - 1) {
    currentIndex++;
    updateFlashcard();
  }
});

prevBtn.addEventListener("click", () => {
  if (currentIndex > 0) {
    currentIndex--;
    updateFlashcard();
  }
});

topicInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    learnBtn.click(); // trigger the same click logic
  }
});
let currentMinute = 0;

function highlightMinute() {
  const allCards = document.querySelectorAll(".flashcard");

  // Remove active class from all
  allCards.forEach(card => card.classList.remove("active"));

  // Add active class to current card
  if (allCards[currentMinute]) {
    allCards[currentMinute].classList.add("active");
  }

  currentMinute++;

  // Stop after 5 minutes
  if (currentMinute >= allCards.length) {
    clearInterval(minuteTimer);
  }
}
currentMinute = 0;
highlightMinute(); // highlight first card immediately

const minuteTimer = setInterval(highlightMinute, 60000); // 1 minute
