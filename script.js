const messages = [
    "Ты уверена?",
    "Точно уверена??",
    "Совсем-совсем уверена?",
    "Пупсик, пожалуйста...",
    "Просто подумай ещё раз!",
    "Если скажешь «нет», мне будет очень грустно...",
    "Мне будет очень грустно...",
    "Мне будет очень-очень-очень грустно...",
    "Ладно, я перестану спрашивать...",
    "Шучу 😘 Просто скажи «да»! ❤️"
];

let messageIndex = 0;

function handleNoClick() {
    const noButton = document.querySelector('.no-button');
    const yesButton = document.querySelector('.yes-button');

    noButton.textContent = messages[messageIndex];
    messageIndex = (messageIndex + 1) % messages.length;

    const currentSize = parseFloat(
        window.getComputedStyle(yesButton).fontSize
    );
    yesButton.style.fontSize = `${currentSize * 1.5}px`;
}

function handleYesClick() {
    window.location.href = "yes_page.html";
}