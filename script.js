// ===== Settings =====
const messages = [
    "Are you sure?",
    "Really sure??",
    "Totally, completely sure?",
    "Gulasal, pretty please...",
    "Just think about it once more!",
    "If you say no, I'll be really sad...",
    "I'll be so sad...",
    "I'll be very, very, very sad...",
    "Okay, I'll stop asking...",
    "Just kidding 😘 Say yes! ❤️"
];

const hints = [
    "Choose with your heart 💕",
    "Hmm... the Yes button got bigger 👀",
    "It keeps growing while you think 😏",
    "I'm a patient guy 🥺",
    "The No button is tired and running away 🏃‍♂️",
];

// max size of the Yes button (smaller on phones so it fits)
const MAX_YES_SCALE = window.innerWidth < 500 ? 2.2 : 3;
const RUNAWAY_AFTER = 5;      // after this many "No" clicks the button starts running away

// ===== Elements =====
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const hint = document.getElementById("hint");
const heartsLayer = document.querySelector(".hearts");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let noCount = 0;
let yesScale = 1;

// ===== "No" button =====
function handleNoClick() {
    noBtn.textContent = messages[noCount % messages.length];
    noCount++;

    // "Yes" grows, but not forever (it used to overflow the screen)
    yesScale = Math.min(yesScale * 1.3, MAX_YES_SCALE);
    yesBtn.style.setProperty("--scale", yesScale);

    hint.textContent = hints[Math.min(Math.floor(noCount / 2), hints.length - 1)];

    noBtn.classList.remove("shake");
    void noBtn.offsetWidth; // restart the animation
    noBtn.classList.add("shake");

    if (noCount >= RUNAWAY_AFTER) {
        if (!noBtn.classList.contains("runaway")) {
            // move it to <body>: the card has transform/blur,
            // which would make position: fixed relative to the card
            document.body.appendChild(noBtn);
            noBtn.classList.add("runaway");
        }
        moveNoButton();
    }
}

function moveNoButton() {
    const pad = 16;
    const rect = noBtn.getBoundingClientRect();
    const yesRect = yesBtn.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width - pad;
    const maxY = window.innerHeight - rect.height - pad;

    // find a spot that does not cover the Yes button
    let x, y, tries = 0;
    do {
        x = pad + Math.random() * Math.max(0, maxX - pad);
        y = pad + Math.random() * Math.max(0, maxY - pad);
        tries++;
    } while (
        tries < 20 &&
        x < yesRect.right + 10 && x + rect.width > yesRect.left - 10 &&
        y < yesRect.bottom + 10 && y + rect.height > yesRect.top - 10
    );

    noBtn.style.left = `${x}px`;
    noBtn.style.top = `${y}px`;
}

// Runs away on mouse hover (on phones, on tap)
noBtn.addEventListener("mouseenter", () => {
    if (noBtn.classList.contains("runaway")) moveNoButton();
});
noBtn.addEventListener("click", handleNoClick);

// ===== "Yes" button =====
function handleYesClick() {
    yesBtn.disabled = true;
    noBtn.style.display = "none";
    burstHearts(40);
    setTimeout(() => {
        window.location.href = "yes_page.html";
    }, reduceMotion ? 0 : 900);
}
yesBtn.addEventListener("click", handleYesClick);

// ===== Hearts =====
const heartChars = ["❤️", "💖", "💕", "💗", "💘", "🌸"];

function spawnHeart(fromX) {
    const h = document.createElement("span");
    h.className = "heart";
    h.textContent = heartChars[Math.floor(Math.random() * heartChars.length)];
    h.style.left = `${fromX ?? Math.random() * 100}vw`;
    h.style.fontSize = `${14 + Math.random() * 22}px`;
    h.style.animationDuration = `${6 + Math.random() * 6}s`;
    heartsLayer.appendChild(h);
    h.addEventListener("animationend", () => h.remove());
}

function burstHearts(n) {
    if (reduceMotion) return;
    for (let i = 0; i < n; i++) {
        setTimeout(() => {
            const h = document.createElement("span");
            h.className = "heart";
            h.textContent = heartChars[Math.floor(Math.random() * heartChars.length)];
            h.style.left = `${Math.random() * 100}vw`;
            h.style.fontSize = `${20 + Math.random() * 26}px`;
            h.style.animationDuration = `${1.5 + Math.random() * 1.5}s`;
            heartsLayer.appendChild(h);
            h.addEventListener("animationend", () => h.remove());
        }, i * 15);
    }
}

if (!reduceMotion) {
    setInterval(() => spawnHeart(), 700);
}
