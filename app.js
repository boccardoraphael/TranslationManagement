const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

class Participant {
    constructor(name, hourlyCapacity, hoursPerDay, isAI = false) {
        this.name = name;
        this.hourlyCapacity = hourlyCapacity;
        this.hoursPerDay = hoursPerDay;
        this.isAI = isAI;
    }

    get dailyCapacity() {
        return this.hourlyCapacity * this.hoursPerDay;
    }

    get quality() {
        return this.isAI ? 50 : 80; // AI has lower quality, human translator has higher quality
    }
}

function calculateDeliveryTimeAndQuality(translators, reviewers, totalWords) {
    const totalTranslationCapacity = translators.reduce((acc, curr) => acc + curr.dailyCapacity, 0);
    const translationDays = Math.ceil(totalWords / totalTranslationCapacity);

    const totalReviewCapacity = reviewers.reduce((acc, curr) => acc + curr.dailyCapacity, 0);
    const reviewDays = reviewers.length > 0 ? Math.ceil(totalWords / totalReviewCapacity) : 0;

    const totalDays = translationDays + reviewDays;

    const translationQuality = translators.reduce((acc, curr) => acc + curr.quality, 0) / translators.length;
    const reviewQuality = reviewers.length > 0 ? 100 : translationQuality;
    const finalQuality = (translationQuality + reviewQuality) / 2;

    return { totalDays, finalQuality };
}

app.post('/calculate', (req, res) => {
    try {
        const totalWords = parseInt(req.body.totalWords, 10);
        const translators = req.body.translators.map(t => new Participant(t.name, t.hourlyCapacity, t.hoursPerDay, t.isAI));
        const reviewers = req.body.reviewers.map(r => new Participant(r.name, r.hourlyCapacity, r.hoursPerDay));
        const { totalDays, finalQuality } = calculateDeliveryTimeAndQuality(translators, reviewers, totalWords);
        res.json({ totalDays, finalQuality });
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
