// ─── DOM Elements ────────────────────────────────────────────────────
const form = document.getElementById('search-form');
const input = document.getElementById('search-input');
const gallery = document.getElementById('gallery');
const status = document.getElementById('status');
const stats = document.getElementById('stats');
const tagsContainer = document.getElementById('tags');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxTitle = document.getElementById('lightbox-title');
const lightboxSource = document.getElementById('lightbox-source');
const closeLightbox = document.getElementById('close-lightbox');

// ─── API Keys & Config ───────────────────────────────────────────────
const API_KEYS = {
    unsplash: 's7YW6sR42xIA2kt3BWT2FyHMZmE8wsRGNv9NAV2jQ6k',
    pexels: 'cleanlDveYzwFDooqnRociEH25BZB3eRNMy3XTj3VrWHtLdRvtUz9PX8',
    pixabay: '42429348-8c60b0bc3a2747156fa9be5db'
};

const RESULTS_PER_PROVIDER = 15;

// Proxies to bypass CORS blocks for Reddit
const CORS_PROXIES = [
    url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    url => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    url => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
];

// ─── Subreddit expansion map ─────────────────────────────────────────
const SUBREDDIT_MAP = {
    // Animals
    cats: ['cats', 'aww', 'catpictures', 'IllegallySmolCats', 'catpics'],
    dogs: ['dogs', 'aww', 'dogpictures', 'rarepuppers', 'dogsofredditt'],
    animals: ['aww', 'animals', 'NatureIsFuckingLit', 'AnimalsBeingBros'],
    wildlife: ['wildlife', 'NatureIsFuckingLit', 'earthporn', 'wildlifephotography'],
    birds: ['birds', 'birdpics', 'whatsthisbird', 'birding'],

    // Nature / Places
    nature: ['EarthPorn', 'NatureIsFuckingLit', 'nature', 'wildlifephotography'],
    mountains: ['EarthPorn', 'hiking', 'mountains', 'alpinism'],
    ocean: ['ocean', 'beachporn', 'AbandonedPorn', 'EarthPorn'],
    space: ['spaceporn', 'Astronomy', 'astrophotography', 'space'],
    forest: ['EarthPorn', 'forests', 'hiking', 'nature'],
    sunset: ['EarthPorn', 'sunset', 'skyporn', 'amateurphotography'],
    sky: ['skyporn', 'clouds', 'EarthPorn', 'amateurphotography'],

    // Urban / Architecture
    city: ['CityPorn', 'UrbanHell', 'architecture', 'UrbanPlanning'],
    architecture: ['architecture', 'ArchitecturePorn', 'brutalism', 'CityPorn'],
    street: ['streetphotography', 'analog', 'urbanphotography', 'photojournalism'],

    // Food
    food: ['FoodPorn', 'food', 'Cooking', 'recipes'],
    pizza: ['Pizza', 'FoodPorn', 'food'],
    coffee: ['Coffee', 'espresso', 'cafe', 'latteart'],
    burger: ['burgers', 'FoodPorn', 'food'],
    sushi: ['sushi', 'FoodPorn', 'japanesefood'],

    // Tech / Gaming
    gaming: ['gaming', 'pcgaming', 'games', 'GameScreens'],
    cyberpunk: ['cyberpunk', 'ImaginaryFuturism', 'retrofuturism', 'synthwave'],
    retro: ['retrogaming', 'PixelArt', 'retro', 'nostalgia'],

    // Art / Design
    art: ['Art', 'ImaginaryLandscapes', 'DigitalArt', 'drawing'],
    photography: ['photos', 'amateurphotography', 'itookapicture', 'photojournalism'],
    portrait: ['portraits', 'analog', 'itookapicture', 'humanporn'],
    minimal: ['minimalism', 'malelivingspace', 'designporn'],

    // Sci-fi / Fantasy
    fantasy: ['ImaginaryLandscapes', 'ImaginaryMonsters', 'ImaginaryCharacters', 'Fantasy'],
    scifi: ['ImaginaryFuturism', 'ImaginaryTechnology', 'scifi', 'ImaginaryStarships'],

    // Moods / Aesthetics
    dark: ['DarkAesthetics', 'dark', 'goth', 'moody'],
    cozy: ['CozyPlaces', 'hygge', 'malelivingspace', 'cozygames'],
    aesthetic: ['aesthetic', 'softcore', 'DesignPorn', 'minimalism'],
    vintage: ['vintage', 'analog', 'OldSchoolCool', 'retro'],

    // Cars / Vehicles
    cars: ['carporn', 'cars', 'Autos', 'classiccars'],
    motorcycles: ['motorcycles', 'motocamping', 'dirtbikes'],

    // Weather
    rain: ['rain', 'CozyPlaces', 'skyporn', 'EarthPorn'],
    snow: ['snowboarding', 'skiing', 'EarthPorn', 'winter'],
};

// ─── Utilities ───────────────────────────────────────────────────────
function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Smart query → subreddit resolver
function resolveSubreddits(query) {
    const q = query.toLowerCase().trim();
    const matched = new Set();

    if (SUBREDDIT_MAP[q]) {
        SUBREDDIT_MAP[q].forEach(s => matched.add(s));
    }

    for (const [key, subs] of Object.entries(SUBREDDIT_MAP)) {
        if (q.includes(key) || key.includes(q)) {
            subs.forEach(s => matched.add(s));
        }
    }

    matched.add(q.replace(/\s+/g, ''));
    return [...matched];
}

async function extractImagesFromRSS(xmlText, providerLabel) {
    const images = [];
    try {
        const xml = new DOMParser().parseFromString(xmlText, 'application/xml');
        if (xml.querySelector('parsererror')) throw new Error('Invalid XML');

        const entries = Array.from(xml.querySelectorAll('entry'));

        entries.forEach(el => {
            if (images.length >= RESULTS_PER_PROVIDER) return;

            const title = el.querySelector('title')?.textContent?.trim() || 'Reddit Image';
            const linkEl = el.querySelector('link');
            const link = linkEl?.getAttribute('href') || '#';
            const content = el.querySelector('content')?.textContent || '';

            const highResMatch = content.match(/<a href=["']([^"']+\.(?:jpg|jpeg|png|gif))["']/i);
            const thumbMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);

            let imgSrc = highResMatch ? highResMatch[1] : (thumbMatch ? thumbMatch[1] : null);

            if (imgSrc) {
                images.push({
                    src: imgSrc.replace(/&amp;/g, '&'),
                    title: title,
                    link: link,
                    provider: providerLabel
                });
            }
        });
    } catch (e) {
        console.warn(`Failed to parse RSS for ${providerLabel}`);
    }
    return images;
}

async function fetchWithProxyFallback(targetUrl) {
    let lastErr;
    for (const makeProxy of CORS_PROXIES) {
        try {
            const res = await fetch(makeProxy(targetUrl));
            const text = await res.text();

            let unwrappedText = text;
            try {
                const json = JSON.parse(text);
                if (json?.contents) unwrappedText = json.contents;
            } catch (_) { }

            if (unwrappedText.includes('"error": 403') || unwrappedText.includes('"reason": "private"')) {
                throw new Error('Reddit 403 Forbidden / Private');
            }
            if (unwrappedText.includes('"error": 429')) {
                throw new Error('Reddit 429 Rate Limited');
            }

            return unwrappedText;
        } catch (e) {
            lastErr = e;
        }
    }
    throw lastErr || new Error('All proxies failed');
}

// ─── Fetchers ────────────────────────────────────────────────────────

async function fetchSingleSubreddit(subName, labelOverride) {
    const url = `https://www.reddit.com/r/${encodeURIComponent(subName)}/hot.rss?limit=25`;
    try {
        const xmlText = await fetchWithProxyFallback(url);
        let unwrapped = xmlText;
        try { const j = JSON.parse(xmlText); if (j?.contents) unwrapped = j.contents; } catch (_) { }
        if (
            unwrapped.includes('"reason": "private"') ||
            unwrapped.includes('"error": 403') ||
            unwrapped.includes('"error": 404')
        ) return [];
        return await extractImagesFromRSS(unwrapped, labelOverride || `r/${subName}`);
    } catch {
        return [];
    }
}

async function fetchSubredditImages(query) {
    const subreddits = resolveSubreddits(query);
    const limited = subreddits.slice(0, 6);

    const results = await Promise.allSettled(
        limited.map(sub => fetchSingleSubreddit(sub))
    );

    return results
        .filter(r => r.status === 'fulfilled')
        .flatMap(r => r.value);
}

async function fetchRedditImages(query) {
    const url = `https://www.reddit.com/search.rss?q=${encodeURIComponent(query)}&limit=30`;
    try {
        const xmlText = await fetchWithProxyFallback(url);
        let unwrapped = xmlText;
        try { const j = JSON.parse(xmlText); if (j?.contents) unwrapped = j.contents; } catch (_) { }
        return await extractImagesFromRSS(unwrapped, 'Reddit');
    } catch (err) {
        console.warn('Reddit Search RSS failed:', err);
        return [];
    }
}

async function fetchUnsplashImages(query) {
    try {
        const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${RESULTS_PER_PROVIDER}&client_id=${API_KEYS.unsplash}`);
        if (!res.ok) throw new Error('Unsplash Error');
        const data = await res.json();

        return (data.results || []).map(photo => ({
            src: photo.urls.regular,
            title: photo.description || photo.alt_description || 'Unsplash Image',
            link: photo.links.html,
            provider: 'Unsplash'
        }));
    } catch (err) {
        console.warn('Unsplash failed:', err);
        return [];
    }
}

async function fetchPixabayImages(query) {
    try {
        const res = await fetch(`https://api.pixabay.com/api/?key=${API_KEYS.pixabay}&q=${encodeURIComponent(query)}&image_type=photo&per_page=${RESULTS_PER_PROVIDER}`);
        if (!res.ok) throw new Error('Pixabay Error');
        const data = await res.json();

        return (data.hits || []).map(hit => ({
            src: hit.largeImageURL,
            title: hit.tags || 'Pixabay Image',
            link: hit.pageURL,
            provider: 'Pixabay'
        }));
    } catch (err) {
        console.warn('Pixabay failed:', err);
        return [];
    }
}

async function fetchPexelsImages(query) {
    try {
        const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${RESULTS_PER_PROVIDER}`, {
            headers: { Authorization: API_KEYS.pexels }
        });
        if (!res.ok) throw new Error('Pexels Error');
        const data = await res.json();

        return (data.photos || []).map(photo => ({
            src: photo.src.large,
            title: photo.alt || 'Pexels Image',
            link: photo.url,
            provider: 'Pexels'
        }));
    } catch (err) {
        console.warn('Pexels failed:', err);
        return [];
    }
}

const clearSearch = document.getElementById('clear-search');

// ─── Search History / State (optional improvement) ───────────

// ─── Input Visuals ───────────
input.addEventListener('input', () => {
    clearSearch.style.display = input.value.length > 0 ? 'block' : 'none';
});

clearSearch.onclick = () => {
    input.value = '';
    clearSearch.style.display = 'none';
    input.focus();
};

// ─── Lightbox Logic ──────────────────────────────────────────────────
function openLightbox(img) {
    lightboxImg.src = img.src;
    lightboxTitle.innerText = img.title;
    lightboxSource.href = img.link;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightboxModal() {
    lightbox.classList.remove('active');
    document.body.style.overflow = 'auto';
    setTimeout(() => { lightboxImg.src = ''; }, 300);
}

closeLightbox.addEventListener('click', (e) => {
    e.stopPropagation();
    closeLightboxModal();
});

lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('close-lightbox')) {
        closeLightboxModal();
    }
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightboxModal();
});

// ─── Main Logic ──────────────────────────────────────────────────────
async function performSearch(query) {
    if (!query) return;

    gallery.innerHTML = '';
    stats.style.display = 'none';
    status.innerHTML = `<i class="fas fa-circle-notch spinner"></i> Exploring "${escapeHtml(query)}"...`;

    const results = await Promise.allSettled([
        fetchRedditImages(query),
        fetchSubredditImages(query),
        fetchUnsplashImages(query),
        fetchPixabayImages(query),
        fetchPexelsImages(query)
    ]);

    let allImages = [];
    results.forEach(result => {
        if (result.status === 'fulfilled') {
            allImages = allImages.concat(result.value);
        }
    });

    if (allImages.length === 0) {
        status.innerHTML = `No visuals found for "${escapeHtml(query)}". Try something else!`;
        return;
    }

    allImages = shuffleArray(allImages);
    status.innerHTML = '';

    const providers = [...new Set(allImages.map(img => img.provider))];
    stats.style.display = 'block';
    stats.innerHTML = `Found <strong>${allImages.length}</strong> highlights from ${providers.length} sources`;

    gallery.innerHTML = '';
    allImages.forEach((img, index) => {
        const card = document.createElement('div');
        card.className = 'img-card';
        card.style.animationDelay = `${index * 0.05}s`;
        card.innerHTML = `
                    <img src="${img.src}" alt="${escapeHtml(img.title)}" loading="lazy">
                    <div class="overlay">
                        <span class="provider-badge ${img.provider.startsWith('r/') ? 'Reddit' : img.provider}">${img.provider}</span>
                        <div class="img-title">${escapeHtml(img.title)}</div>
                    </div>
                `;
        card.onclick = () => openLightbox(img);
        gallery.appendChild(card);
    });
}

form.onsubmit = (e) => {
    e.preventDefault();
    performSearch(input.value.trim());
};

tagsContainer.onclick = (e) => {
    if (e.target.classList.contains('tag')) {
        const tag = e.target.innerText;
        input.value = tag;
        performSearch(tag);
    }
};