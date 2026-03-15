window.NexoraRegistry.register({
    id: 'advice',
    name: 'Advice Slip API',
    intents: [
        /give me (some )?advice/i,
        /what should i do/i,
        /any (life )?advice/i,
        /advice( please)?/i,
        /inspire me/i,
        /words of wisdom/i
    ],

    async handle(match) {
        try {
            // Cache-bust to avoid browser caching the same advice
            const res = await fetch(`https://api.adviceslip.com/advice?t=${Date.now()}`);

            if (!res.ok) {
                return { text: "I wasn't able to fetch advice right now. Here's some free advice: try again later!" };
            }

            const data = await res.json();
            const slip = data?.slip;

            if (!slip || !slip.advice) {
                return { text: "No advice found. Sometimes silence is the best wisdom." };
            }

            const html = `
            <div class="rich-widget advice-widget">
                <div class="widget-title"><i class="fas fa-lightbulb"></i> Advice #${slip.id}</div>
                <blockquote class="advice-quote">
                    <i class="fas fa-quote-left advice-quote-icon"></i>
                    ${escapeHtml(slip.advice)}
                </blockquote>
                <button class="widget-refresh-btn" onclick="window._fetchNewAdvice()">
                    <i class="fas fa-rotate-right"></i> More advice
                </button>
            </div>`;

            return {
                html,
                text: slip.advice
            };
        } catch (err) {
            return { text: "The advice service is unavailable. Best advice I can give: come back later!" };
        }
    }
});

// Helper so the "More advice" button can re-trigger
window._fetchNewAdvice = () => {
    if (window.NexoraRegistry && typeof window.NexoraRegistry.trigger === 'function') {
        window.NexoraRegistry.trigger('give me advice');
    }
};

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}