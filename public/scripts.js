let translatorCount = 0;
let reviewerCount = 0;

function addTranslator() {
    const container = document.getElementById('translator_fields');
    translatorCount++;
    const id = `translator_${translatorCount}`;
    container.insertAdjacentHTML('beforeend', `
        <div id="${id}">
            <label>Translator ${translatorCount} Name:</label>
            <input type="text" name="translator_name_${translatorCount}" required>
            <label>Hourly Capacity (words/hour):</label>
            <input type="number" name="translator_hourly_${translatorCount}" required>
            <label>Hours Per Day:</label>
            <input type="number" name="translator_hours_${translatorCount}" required>
            <button type="button" onclick="removeElement('${id}')">Remove</button>
        </div>
    `);
}

function addAITranslator() {
    const container = document.getElementById('translator_fields');
    translatorCount++;
    const id = `translator_${translatorCount}`;
    container.insertAdjacentHTML('beforeend', `
        <div id="${id}">
            <label>AI Translator ${translatorCount} Name:</label>
            <input type="text" name="translator_name_${translatorCount}" value="AI Translator" disabled>
            <label>Hourly Capacity (words/hour):</label>
            <input type="number" name="translator_hourly_${translatorCount}" value="10000" required>
            <label>Hours Per Day:</label>
            <input type="number" name="translator_hours_${translatorCount}" value="24" required>
            <input type="hidden" name="translator_isAI_${translatorCount}" value="true">
            <button type="button" onclick="removeElement('${id}')">Remove</button>
        </div>
    `);
}

function addReviewer() {
    const container = document.getElementById('reviewer_fields');
    reviewerCount++;
    const id = `reviewer_${reviewerCount}`;
    container.insertAdjacentHTML('beforeend', `
        <div id="${id}">
            <label>Reviewer ${reviewerCount} Name:</label>
            <input type="text" name="reviewer_name_${reviewerCount}" required>
            <label>Hourly Capacity (words/hour):</label>
            <input type="number" name="reviewer_hourly_${reviewerCount}" required>
            <label>Hours Per Day:</label>
            <input type="number" name="reviewer_hours_${reviewerCount}" required>
            <button type="button" onclick="removeElement('${id}')">Remove</button>
        </div>
    `);
}

function removeElement(id) {
    const element = document.getElementById(id);
    element.parentNode.removeChild(element);
}

document.getElementById('calcForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const totalWords = document.getElementById('total_words').value;

    const translators = [];
    for (let i = 1; i <= translatorCount; i++) {
        const name = document.querySelector(`input[name="translator_name_${i}"]`).value;
        const hourlyCapacity = parseInt(document.querySelector(`input[name="translator_hourly_${i}"]`).value, 10);
        const hoursPerDay = parseInt(document.querySelector(`input[name="translator_hours_${i}"]`).value, 10);
        const isAI = document.querySelector(`input[name="translator_isAI_${i}"]`) ? true : false;
        translators.push({ name, hourlyCapacity, hoursPerDay, isAI });
    }

    const reviewers = [];
    for (let i = 1; i <= reviewerCount; i++) {
        const name = document.querySelector(`input[name="reviewer_name_${i}"]`).value;
        const hourlyCapacity = parseInt(document.querySelector(`input[name="reviewer_hourly_${i}"]`).value, 10);
        const hoursPerDay = parseInt(document.querySelector(`input[name="reviewer_hours_${i}"]`).value, 10);
        reviewers.push({ name, hourlyCapacity, hoursPerDay });
    }

    fetch('/calculate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ totalWords, translators, reviewers })
    })
    .then(response => response.json())
    .then(data => {
        const resultDiv = document.getElementById('result');
        resultDiv.innerHTML = `Estimated delivery time: ${data.totalDays} days<br>Quality: ${data.finalQuality.toFixed(2)}%`;
        openModal();
    })
    .catch(error => console.error('Error:', error));
});

function openModal() {
    const modal = document.getElementById('resultModal');
    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('resultModal');
    modal.style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('resultModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}
