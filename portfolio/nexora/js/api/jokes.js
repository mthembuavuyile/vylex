window.NexoraRegistry.register({
    id: 'jokes',
    name: 'JokeAPI',
    intents: [
        /tell me a joke/i,
        /give me a joke/i,
        /say something funny/i,
        /make me laugh/i,
        /joke( please)?/i
    ],

    async handle(match) {
        try {
            const res = await fetch(
                'https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,religious,political,racist,sexist,explicit'
            );

            if (!res.ok) {
                return { text: "I tried to find a joke but the joke service isn't cooperating right now." };
            }

            const joke = await res.json();

            if (joke.error) {
                return { text: "Couldn't fetch a joke right now. Try again!" };
            }

            let jokeHtml, jokeText;

            if (joke.type === 'single') {
                jokeHtml = `<p class="joke-single">${escapeHtml(joke.joke)}</p>`;
                jokeText = joke.joke;
            } else {
                // Two-part (setup + delivery)
                jokeHtml = `
                    <p class="joke-setup">${escapeHtml(joke.setup)}</p>
                    <p class="joke-delivery"><i class="fas fa-drumstick-bite"></i> ${escapeHtml(joke.delivery)}</p>`;
                jokeText = `${joke.setup} ... ${joke.delivery}`;
            }

            const categoryIcon = {
                Programming: 'fa-laptop-code',
                Misc:        'fa-face-smile-wink',
                Dark:        'fa-moon',
                Pun:         'fa-face-grin-squint',
                Spooky:      'fa-ghost',
                Christmas:   'fa-tree'
            }[joke.category] || 'fa-face-smile';

            const html = `
            <div class="rich-widget">
                <div class="widget-title">
                    <i class="fas ${categoryIcon}"></i> ${escapeHtml(joke.category)} Joke
                </div>
                <div class="joke-body">${jokeHtml}</div>
                <button class="widget-refresh-btn" onclick="window._fetchNewJoke()">
                    <i class="fas fa-rotate-right"></i> Another one
                </button>
            </div>`;

            return { html, text: jokeText };
        } catch (err) {
            return { text: "The joke service is currently unavailable. Maybe that's the joke?" };
        }
    }
});

// Helper so the "Another one" button can trigger a new joke
window._fetchNewJoke = () => {
    if (window.NexoraRegistry && typeof window.NexoraRegistry.trigger === 'function') {
        window.NexoraRegistry.trigger('tell me a joke');
    }
};

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}