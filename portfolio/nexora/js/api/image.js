window.NexoraRegistry.register({
    id: 'image',
    name: 'Multi-Provider Image Search',
    intents: [
    // Matches: "Show me a photo of a cat", "Show me an image of New York"
    /show me (?:a |an )?(?:photo|image|picture|pic) of (.+)/i,
    
    // Matches: "Find a picture of the moon", "Find an image of a dog"
    /find (?:a |an )?(?:photo|image|picture|pic) of (.+)/i,
    
    // Matches: "Search for a photo of a sunset"
    /search for (?:a |an )?(?:photo|image|picture|pic) of (.+)/i,
    
    // Matches: "Photo of a car", "Image of a computer" (Anchored to start to avoid false positives)
    /^(?:photo|image|picture|pic) of (.+)/i,
    
    // Matches: "What does a pangolin look like?"
    /what does (?:a |an )?(.+) look like/i,
    
    // Matches: "Show London image", "Show matrix photo"
    /show (.+) (?:image|photo|picture|pic)/i,
    
    // Matches: "I want to see a picture of a black hole"
    /i want to see (?:a |an )?(?:photo|image|picture|pic) of (.+)/i
],

    async handle(match) {
        // Pull the subject from whichever capture group has it
        const subject = (match[2] || match[1] || '').replace(/['"?.]/g, '').trim();

        if (!subject) {
            return { text: "Please tell me what you'd like a photo of." };
        }

        // API Keys - In a production SaaS, fetch these from your backend
        const API_KEYS = {
            unsplash: 's7YW6sR42xIA2kt3BWT2FyHMZmE8wsRGNv9NAV2jQ6k',
            pexels: 'cleanlDveYzwFDooqnRociEH25BZB3eRNMy3XTj3VrWHtLdRvtUz9PX8',
            pixabay: '42429348-8c60b0bc3a2747156fa9be5db'
        };

        const query = encodeURIComponent(subject);
        let imageData = null;

        // 1. Try Unsplash API
        try {
            const unsplashRes = await fetch(`https://api.unsplash.com/search/photos?query=${query}&per_page=1&client_id=${API_KEYS.unsplash}`);
            const unsplashData = await unsplashRes.json();
            if (unsplashData.results && unsplashData.results.length > 0) {
                imageData = {
                    src: unsplashData.results[0].urls.regular,
                    link: unsplashData.results[0].links.html,
                    provider: 'Unsplash'
                };
            }
        } catch (e) { console.warn("Unsplash fetch failed, falling back..."); }

        // 2. Fallback to Pexels API
        if (!imageData) {
            try {
                const pexelsRes = await fetch(`https://api.pexels.com/v1/search?query=${query}&per_page=1`, {
                    headers: { Authorization: API_KEYS.pexels }
                });
                const pexelsData = await pexelsRes.json();
                if (pexelsData.photos && pexelsData.photos.length > 0) {
                    imageData = {
                        src: pexelsData.photos[0].src.large,
                        link: pexelsData.photos[0].url,
                        provider: 'Pexels'
                    };
                }
            } catch (e) { console.warn("Pexels fetch failed, falling back..."); }
        }

        // 3. Fallback to Pixabay API
        if (!imageData) {
            try {
                const pixabayRes = await fetch(`https://api.pixabay.com/api/?key=${API_KEYS.pixabay}&q=${query}&image_type=photo&per_page=3`);
                const pixabayData = await pixabayRes.json();
                if (pixabayData.hits && pixabayData.hits.length > 0) {
                    imageData = {
                        src: pixabayData.hits[0].largeImageURL,
                        link: pixabayData.hits[0].pageURL,
                        provider: 'Pixabay'
                    };
                }
            } catch (e) { console.warn("Pixabay fetch failed."); }
        }

        // 4. Handle Complete Failure
        if (!imageData) {
            return { text: `Sorry, I couldn't find any images of "${subject}" across my providers right now.` };
        }

        // 5. Render Success UI
        const html = `
        <div class="rich-widget image-widget">
            <div class="widget-title">
                <i class="fas fa-image"></i> Photo: ${escapeHtml(subject)}
            </div>
            <div class="image-container" style="margin: 10px 0; border-radius: 12px; overflow: hidden;">
                <img
                    src="${imageData.src}"
                    alt="${escapeHtml(subject)}"
                    class="widget-image"
                    style="width: 100%; height: auto; display: block; object-fit: cover; max-height: 350px;"
                    loading="lazy"
                    onerror="this.parentElement.innerHTML='<p class=\\'image-error\\' style=\\'color: var(--error); font-size: 0.85rem;\\'>Image failed to load.</p>'"
                />
            </div>
            <a
                href="${imageData.link}"
                target="_blank"
                rel="noopener noreferrer"
                class="widget-link"
                style="font-size: 0.8rem; color: var(--primary); text-decoration: none; font-weight: 600;"
            >
                View on ${imageData.provider} <i class="fas fa-external-link-alt" style="font-size: 0.7rem; margin-left: 3px;"></i>
            </a>
        </div>`;

        return {
            html,
            text: `Here's a photo of ${subject} from ${imageData.provider}.`
        };
    }
});

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}