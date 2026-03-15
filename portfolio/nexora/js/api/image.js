window.NexoraRegistry.register({
    id: 'image',
    name: 'Multi-Provider Image Search',
    intents: [
        // "Show me a photo of a cat", "Show me an image of New York"
        /show me (?:a |an )?(?:photo|image|picture|pic) of (.+)/i,

        // "Find a picture of the moon", "Find an image of a dog"
        /find (?:a |an )?(?:photo|image|picture|pic) of (.+)/i,

        // "Search for a photo of a sunset"
        /search for (?:a |an )?(?:photo|image|picture|pic) of (.+)/i,

        // "Photo of a car", "Image of a computer"
        /^(?:photo|image|picture|pic) of (.+)/i,

        // "What does a pangolin look like?"
        /what does (?:a |an )?(.+) look like/i,

        // "Show London image", "Show matrix photo"
        /show (.+) (?:image|photo|picture|pic)/i,

        // "I want to see a picture of a black hole"
        /i want to see (?:a |an )?(?:photo|image|picture|pic) of (.+)/i,

        // "Get me some images of mountains"
        /get (?:me )?(?:some |a few )?(?:photos?|images?|pictures?|pics?) of (.+)/i,

        // "Can you show me pictures of red pandas?"
        /can you (?:show|find|get) (?:me )?(?:some |a few |an? )?(?:photos?|images?|pictures?|pics?) of (.+)/i,

        // "Images of ancient ruins"
        /^(?:images?|photos?|pictures?|pics?) of (.+)/i,
    ],

    async handle(match) {
        const subject = (match[2] || match[1] || '').replace(/['"?.]/g, '').trim();

        if (!subject) {
            return { text: "Please tell me what you'd like photos of." };
        }

        // ─── API Keys ───────────────────────────────────────────────────────────
        // Replace these with your real keys. Pexels: https://www.pexels.com/api/
        // Unsplash: https://unsplash.com/developers
        // Pixabay:  https://pixabay.com/api/docs/
        const API_KEYS = {
            unsplash: 's7YW6sR42xIA2kt3BWT2FyHMZmE8wsRGNv9NAV2jQ6k',
            pexels:   'YOUR_PEXELS_KEY_HERE',   // ← replace this
            pixabay:  '42429348-8c60b0bc3a2747156fa9be5db'
        };

        const RESULTS_PER_PROVIDER = 3; // how many images to fetch from each
        const query = encodeURIComponent(subject);
        const allImages = [];

        // ─── 1. Unsplash ─────────────────────────────────────────────────────────
        try {
            const res = await fetch(
                `https://api.unsplash.com/search/photos?query=${query}&per_page=${RESULTS_PER_PROVIDER}&client_id=${API_KEYS.unsplash}`
            );
            const data = await res.json();
            if (data.results?.length) {
                data.results.forEach(photo => allImages.push({
                    src:      photo.urls.regular,
                    thumb:    photo.urls.small,
                    link:     photo.links.html,
                    author:   photo.user?.name || '',
                    provider: 'Unsplash',
                    color:    photo.color || '#888'
                }));
            }
        } catch (e) { console.warn('Unsplash failed:', e); }

        // ─── 2. Pexels ───────────────────────────────────────────────────────────
        if (API_KEYS.pexels !== 'YOUR_PEXELS_KEY_HERE') {
            try {
                const res = await fetch(
                    `https://api.pexels.com/v1/search?query=${query}&per_page=${RESULTS_PER_PROVIDER}`,
                    { headers: { Authorization: API_KEYS.pexels } }
                );
                const data = await res.json();
                if (data.photos?.length) {
                    data.photos.forEach(photo => allImages.push({
                        src:      photo.src.large,
                        thumb:    photo.src.medium,
                        link:     photo.url,
                        author:   photo.photographer || '',
                        provider: 'Pexels',
                        color:    '#888'
                    }));
                }
            } catch (e) { console.warn('Pexels failed:', e); }
        }

        // ─── 3. Pixabay ──────────────────────────────────────────────────────────
        try {
            const res = await fetch(
                `https://api.pixabay.com/api/?key=${API_KEYS.pixabay}&q=${query}&image_type=photo&per_page=${RESULTS_PER_PROVIDER}&safesearch=true`
            );
            const data = await res.json();
            if (data.hits?.length) {
                data.hits.forEach(hit => allImages.push({
                    src:      hit.largeImageURL,
                    thumb:    hit.webformatURL,
                    link:     hit.pageURL,
                    author:   hit.user || '',
                    provider: 'Pixabay',
                    color:    '#888'
                }));
            }
        } catch (e) { console.warn('Pixabay failed:', e); }

        // ─── 4. Nothing found ────────────────────────────────────────────────────
        if (!allImages.length) {
            return { text: `Sorry, I couldn't find any images of "${subject}" right now. Try a different search term.` };
        }

        // ─── 5. Render grid ──────────────────────────────────────────────────────
        const providerBadgeColors = {
            Unsplash: '#111',
            Pexels:   '#05a081',
            Pixabay:  '#2ec66e'
        };

        const imageCards = allImages.map((img, i) => {
            const badgeColor = providerBadgeColors[img.provider] || '#555';
            return `
            <div class="img-card" style="
                position: relative;
                border-radius: 10px;
                overflow: hidden;
                background: ${img.color};
                cursor: pointer;
                break-inside: avoid;
                margin-bottom: 10px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                transition: transform 0.2s ease, box-shadow 0.2s ease;
            " onmouseover="this.style.transform='scale(1.02)';this.style.boxShadow='0 6px 20px rgba(0,0,0,0.25)'"
               onmouseout="this.style.transform='scale(1)';this.style.boxShadow='0 2px 8px rgba(0,0,0,0.15)'"
               onclick="window.open('${img.link}', '_blank', 'noopener,noreferrer')"
            >
                <img
                    src="${img.thumb}"
                    alt="${escapeHtml(subject)}"
                    loading="lazy"
                    style="width: 100%; height: auto; display: block;"
                    onerror="this.parentElement.style.display='none'"
                />
                <div style="
                    position: absolute;
                    bottom: 0; left: 0; right: 0;
                    padding: 20px 8px 6px;
                    background: linear-gradient(transparent, rgba(0,0,0,0.55));
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                ">
                    ${img.author ? `<span style="color: rgba(255,255,255,0.85); font-size: 0.68rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 65%;">📷 ${escapeHtml(img.author)}</span>` : '<span></span>'}
                    <span style="
                        background: ${badgeColor};
                        color: #fff;
                        font-size: 0.6rem;
                        font-weight: 700;
                        letter-spacing: 0.05em;
                        padding: 2px 6px;
                        border-radius: 4px;
                        text-transform: uppercase;
                        flex-shrink: 0;
                    ">${img.provider}</span>
                </div>
            </div>`;
        }).join('');

        const providersSeen = [...new Set(allImages.map(i => i.provider))];
        const providerSummary = providersSeen.join(' · ');

        const html = `
        <div class="rich-widget image-widget" style="font-family: system-ui, sans-serif;">
            <div class="widget-title" style="
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 12px;
            ">
                <span style="font-weight: 700; font-size: 0.95rem;">
                    <i class="fas fa-images" style="margin-right: 6px; opacity: 0.7;"></i>
                    ${escapeHtml(subject)}
                </span>
                <span style="font-size: 0.7rem; opacity: 0.5;">${allImages.length} results · ${providerSummary}</span>
            </div>

            <div style="
                columns: 2;
                column-gap: 10px;
            ">
                ${imageCards}
            </div>

            <p style="font-size: 0.7rem; opacity: 0.45; margin-top: 8px; text-align: right;">
                Click any image to view on source site
            </p>
        </div>`;

        return {
            html,
            text: `Here are ${allImages.length} photos of "${subject}" from ${providerSummary}.`
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