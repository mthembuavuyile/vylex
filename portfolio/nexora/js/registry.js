// js/registry.js
window.NexoraRegistry = {
    modules:[],

    // Modules call this function to register themselves
    register(module) {
        this.modules.push(module);
        console.log(`[Registry] Loaded module: ${module.name}`);
    },

    // Matches user text against all registered module regular expressions
    matchIntent(text) {
        for (const module of this.modules) {
            for (const regex of module.intents) {
                const match = text.match(regex);
                if (match) {
                    return { module, match };
                }
            }
        }
        return null;
    }
};