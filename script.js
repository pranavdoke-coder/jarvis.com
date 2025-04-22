const questionWords = ["who", "what", "why", "when", "how", "where", "is", "are"];
const websiteOpenTriggers = ["open", "go to", "visit", "launch"];
let recognition;
const responseElement = document.getElementById('response');

function startListening() {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            responseElement.textContent = "Listening...";
            responseElement.classList.add('listening');
        };

        recognition.onresult = async (event) => {
            const userSpeech = event.results[0][0].transcript.toLowerCase();
            responseElement.textContent = `Analyzing: "${userSpeech}"`;
            responseElement.classList.remove('listening');
            processCommand(userSpeech);
        };

        recognition.onspeechend = () => {
            recognition.stop();
            responseElement.textContent = "Ready.";
            responseElement.classList.remove('listening');
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            let errorMessage = "My systems encountered a slight hiccup. Please try again.";
            if (event.error === 'no-speech') {
                errorMessage = "No speech was detected. Please try speaking again.";
            } else if (event.error === 'audio-capture') {
                errorMessage = "Could not capture audio. Ensure your microphone is working.";
            } else if (event.error === 'not-allowed') {
                errorMessage = "Permission to use the microphone was denied. Please grant access in your browser settings.";
            }
            responseElement.textContent = errorMessage;
            responseElement.classList.remove('listening');
            speakResponse(errorMessage);
        };

        try {
            recognition.start();
        } catch (error) {
            console.error("Error starting speech recognition:", error);
            responseElement.textContent = "Error initializing voice command. Please try again later.";
            responseElement.classList.remove('listening');
            speakResponse("Error initializing voice command. Please try again later.");
        }
    } else {
        responseElement.textContent = "Apologies, sir. Voice command functionality is not supported in this environment.";
        speakResponse("Apologies, sir. Voice command functionality is not supported in this environment.");
    }
}

function speakResponse(responseText) {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(responseText);
    utterance.lang = 'en-US';
    synth.speak(utterance);
}

async function processCommand(command) {
    let websiteToOpen = null;

    for (const trigger of websiteOpenTriggers) {
        if (command.startsWith(trigger)) {
            websiteToOpen = command.substring(trigger.length).trim();
            break;
        }
    }

    if (websiteToOpen) {
        const openDialogs = [
            `As you wish, accessing ${websiteToOpen}.`,
            `Initiating direct link to ${websiteToOpen}. Stand by.`,
            `Connecting to ${websiteToOpen}.`,
            `Affirmative. Opening ${websiteToOpen}.`
        ];
        const randomOpenDialog = openDialogs[Math.floor(Math.random() * openDialogs.length)];
        speakResponse(randomOpenDialog);
        let url = websiteToOpen;
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            url = "http://" + url;
        }
        window.open(url, "_blank");
    } else if (command.startsWith("search wikipedia for")) {
        const query = command.substring(20).trim();
        const wikiDialogs = [
            `Querying Wikipedia archives for "${query}".`,
            `Accessing relevant data on "${query}" from Wikipedia.`,
            `Searching the digital scrolls of Wikipedia for "${query}".`,
            `Fetching information on "${query}" from the Wikipedia database.`
        ];
        const randomWikiDialog = wikiDialogs[Math.floor(Math.random() * wikiDialogs.length)];
        speakResponse(randomWikiDialog);
        const summary = await fetchWikipedia(query);
        speakResponse(summary);
    } else if (command.startsWith("what is the weather")) {
        const weatherDialogs = [
            `Analyzing atmospheric conditions.`,
            `Checking the current weather report.`,
            `Accessing meteorological data.`,
            `Stand by for weather analysis.`
        ];
        const randomWeatherDialog = weatherDialogs[Math.floor(Math.random() * weatherDialogs.length)];
        speakResponse(randomWeatherDialog);
        fetchWeather();
    } else if (command.startsWith("what is the time")) {
        const now = new Date();
        const hours = now.getHours() % 12 || 12;
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const period = now.getHours() < 12 ? 'AM' : 'PM';
        const timeResponse = `The current time is ${hours}:${minutes} ${period}.`;
        const timeDialogs = [
            timeResponse,
            `Temporal coordinates indicate ${hours}:${minutes} ${period}.`,
            `The chronometer reads ${hours}:${minutes} ${period}.`,
            `Current time: ${hours}:${minutes} ${period}.`
        ];
        const randomTimeDialog = timeDialogs[Math.floor(Math.random() * timeDialogs.length)];
        speakResponse(randomTimeDialog);
    } else if (questionWords.some(word => command.startsWith(word))) {
        // If it's a question and not a direct "open" command, try a web search
        const searchDialogs = [
            `Searching the web for: "${command}" to find relevant information.`,
            `Initiating a web query for: "${command}".`,
            `Looking up "${command}" on the internet.`,
            `Commencing a web search for an answer to your question.`
        ];
        const randomSearchDialog = searchDialogs[Math.floor(Math.random() * searchDialogs.length)];
        speakResponse(randomSearchDialog);
        window.open(`https://www.google.com/search?q=${command}`, "_blank");
    } else {
        const defaultDialogs = [
            `Acknowledged. Processing request: "${command}".`,
            `Understood. Evaluating command: "${command}".`,
            `Request received: "${command}".`,
            `Affirmative. Command noted: "${command}".`
        ];
        speakResponse(defaultDialogs[Math.floor(Math.random() * defaultDialogs.length)]);
    }
}

async function fetchWikipedia(query) {
    try {
        const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${query}`);
        const data = await response.json();
        return data.extract || "My data banks lack specific information on that from Wikipedia.";
    } catch (error) {
        console.error("Error accessing Wikipedia:", error);
        return "Connectivity to Wikipedia servers appears unstable.";
    }
}

async function fetchWeather() {
    const apiKey = 'YOUR_OPENWEATHER_API_KEY'; // Replace with your OpenWeather API key
    const city = 'Pune'; // Replace with your preferred city
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    if (apiKey === 'YOUR_OPENWEATHER_API_KEY') {
        speakResponse("Sir, I require an API key to access weather data.");
        document.getElementById('response').textContent = "Weather data unavailable: API key missing.";
        return;
    }

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.cod === '401') {
            speakResponse("Sir, the provided API key for weather data appears to be invalid.");
            document.getElementById('response').textContent = "Weather data unavailable: Invalid API key.";
            return;
        }
        if (data.cod !== 200) {
            speakResponse(`My sensors indicate a problem retrieving weather data for ${city}.`);
            document.getElementById('response').textContent = `Weather data unavailable for ${city}.`;
            return;
        }
        const weather = data.weather[0].description;
        const temperature = data.main.temp;
        const weatherResponseText = `Atmospheric analysis for ${city}: ${weather}, temperature ${temperature}°Celsius.`;
        speakResponse(weatherResponseText);
        document.getElementById('response').textContent = weatherResponseText;
    } catch (error) {
        console.error("Error fetching weather data:", error);
        speakResponse("Unable to retrieve current atmospheric data.");
        document.getElementById('response').textContent = "Weather data unavailable due to a network issue.";
    }
}