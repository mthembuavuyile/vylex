// js/api/math.js
// Newton Math API module for Nexora AI
// Supports: arithmetic, algebra, calculus, trigonometry — conversational & direct input

window.NexoraRegistry.register({
    id: 'math',
    name: 'Newton Math API',
    example: 'what is the derivative of x^2',

    intents: [
        // 1. Direct commands: "derive x^2", "integrate sin(x)", "simplify 2x + 4"
        /^(simplify|factor|derive|integrate|zeroes|tangent|area|cos|sin|tan|arccos|arcsin|arctan|abs|log|expand|limit)\s+(.+)$/i,

        // 2. Natural language (calculus + algebra + arithmetic):
        //    "what is the derivative of x^2"
        //    "find the integral of sin(x)"
        //    "what is 6 + 8"
        //    "calculate 3x^2 + 2x"
        /^(?:what(?:'s|\s+is)?|find(?:\s+the)?|calculate(?:\s+the)?|compute(?:\s+the)?|solve(?:\s+the)?)\s+(?:the\s+)?(derivative|integral|limit|factorization|zeroes|simplification)?\s*(?:of\s+)?(.+?)[\?\.]*$/i,

        // 3. Equation solving: "solve x^2 - 4 = 0"
        /^solve\s+(.+)$/i,

        // 4. Trig questions: "what is cos(45)", "tan 60"
        /^(?:what(?:'s|\s+is)\s+)?(sin|cos|tan|arcsin|arccos|arctan)\s*\(?(.+?)\)?[\?\.]*$/i,

        // 5. Pure arithmetic: "6 + 8", "7 * 3", "(4 + 5) / 3"
        /^([\d\s\+\-\*\/\(\)\.]+)$/,

        // 6. Algebra / expressions with variables: "2x^2 + 3x - 5", "x^2 = 4"
        /^([a-zA-Z\d\s\+\-\*\/\(\)\.\^\=]+)$/
    ],

    async handle(match, appState = {}) {
        let rawOperation = 'simplify';
        let expression = '';

        const fullMatch = (match[0] || '').trim();
        const lowerMatch = fullMatch.toLowerCase();

        // ── Route based on which intent fired ────────────────────────────────

        // Intent 3: explicit "solve ..."
        if (/^solve\s+/i.test(fullMatch)) {
            rawOperation = 'solve';
            expression = match[1];
        }

        // Intent 4: trig shorthand — "cos(45)", "tan 60"
        else if (/^(?:what(?:'s|\s+is)\s+)?(sin|cos|tan|arcsin|arccos|arctan)\s*\(?/i.test(fullMatch)) {
            rawOperation = match[1].toLowerCase();
            expression   = match[2];
        }

        // Intent 2: natural language — "what is ...", "find the ...", "calculate ..."
        else if (/^(?:what(?:'s|\s+is)?|find|calculate|compute)/i.test(fullMatch)) {
            // match[1] = optional operation word (derivative|integral|…), match[2] = expression
            const opWord = (match[1] || '').toLowerCase();
            expression   = (match[2] || '').trim();

            const nlMap = {
                'derivative':     'derive',
                'integral':       'integrate',
                'factorization':  'factor',
                'simplification': 'simplify',
                'zeroes':         'zeroes',
                'limit':          'limit'
            };

            rawOperation = nlMap[opWord] || 'simplify';
        }

        // Intent 1: direct command — "derive x^2", "integrate sin(x)"
        else if (/^(simplify|factor|derive|integrate|zeroes|tangent|area|cos|sin|tan|arccos|arcsin|arctan|abs|log|expand|limit)\s+/i.test(fullMatch)) {
            rawOperation = match[1].toLowerCase();
            expression   = match[2];
        }

        // Intents 5 & 6: raw expression — "7+2", "2x^2 + 3x"
        else {
            rawOperation = 'simplify';
            expression   = match[1] || fullMatch;
        }

        // ── Normalise expression ─────────────────────────────────────────────
        expression = (expression || '').trim()
            .replace(/\s*=\s*$/, '')    // strip trailing "="
            .replace(/×/g, '*')         // replace × with *
            .replace(/÷/g, '/');        // replace ÷ with /

        if (!expression) {
            return { text: "Hmm, I didn't catch the expression. Could you rephrase? E.g. \"what is 6 + 8\" or \"derive x^2\"." };
        }

        // ── Additional operation mapping ─────────────────────────────────────
        const opMap = {
            'derivative': 'derive',
            'integral':   'integrate',
            'factor':     'factor',
            'factorize':  'factor',
            'simplify':   'simplify',
            'calculate':  'simplify',
            'compute':    'simplify'
        };
        const apiOperation = opMap[rawOperation] || rawOperation;

        // ── Fetch from Newton API ────────────────────────────────────────────
        try {
            const encodedExpression = encodeURIComponent(expression);
            const res = await fetch(`https://newton.now.sh/api/v2/${apiOperation}/${encodedExpression}`);

            if (!res.ok) {
                throw new Error(`Newton API returned ${res.status}`);
            }

            const data = await res.json();

            if (!data || data.result === undefined || data.error) {
                return {
                    text: `Hmm, I couldn't compute "${expression}". Double-check the formatting — for example, use "^" for exponents like x^2, and "*" for multiplication.`
                };
            }

            // ── Build friendly conversational reply ──────────────────────────
            const opLabel = this._opLabel(apiOperation);
            const conversationalText = this._buildReply(apiOperation, data.expression, data.result);

            // ── Build Rich Widget ────────────────────────────────────────────
            const html = `
            <div class="rich-widget">
                <div class="widget-title">
                    <i class="fas fa-calculator"></i> ${opLabel}
                </div>
                <div class="math-main" style="padding:12px;background:var(--bg-secondary);border-radius:8px;margin-top:8px;">
                    <div style="font-size:0.85em;opacity:0.75;margin-bottom:4px;">
                        Expression: <strong>${this._escHtml(data.expression)}</strong>
                    </div>
                    <div style="font-size:1.3em;font-family:'DM Mono',monospace;color:var(--accent-color,#4361ee);font-weight:500;">
                        = ${this._escHtml(String(data.result))}
                    </div>
                </div>
            </div>`;

            if (window.MathJax) {
                setTimeout(() => MathJax.typesetPromise(), 100);
            }

            return { html, text: conversationalText };

        } catch (err) {
            console.error('[Math Plugin]', err);

            // Friendly error with context
            if (err.message && err.message.includes('400')) {
                return { text: `I couldn't process "${expression}". Try rephrasing — for example, "x^2 + 2x" instead of "x² + 2x".` };
            }
            return { text: "My math solver is having a moment. Please try again shortly." };
        }
    },

    // ── Helpers ───────────────────────────────────────────────────────────────

    /** Human-readable label for an operation */
    _opLabel(op) {
        const labels = {
            simplify:  'Simplify',
            factor:    'Factor',
            derive:    'Derivative',
            integrate: 'Integral',
            zeroes:    'Zeroes',
            tangent:   'Tangent',
            area:      'Area',
            cos:       'cos',
            sin:       'sin',
            tan:       'tan',
            arccos:    'arccos',
            arcsin:    'arcsin',
            arctan:    'arctan',
            abs:       'Absolute Value',
            log:       'Logarithm',
            expand:    'Expand',
            limit:     'Limit',
            solve:     'Solve'
        };
        return labels[op] || op.charAt(0).toUpperCase() + op.slice(1);
    },

    /** Conversational reply based on operation type */
    _buildReply(op, expression, result) {
        switch (op) {
            case 'simplify':
                return `${expression} simplifies to ${result}.`;
            case 'derive':
                return `The derivative of ${expression} is ${result}.`;
            case 'integrate':
                return `The integral of ${expression} is ${result}.`;
            case 'factor':
                return `${expression} factors to ${result}.`;
            case 'zeroes':
                return `The zeroes of ${expression} are at ${result}.`;
            case 'tangent':
                return `The tangent of ${expression} is ${result}.`;
            case 'area':
                return `The area under ${expression} is ${result}.`;
            case 'cos':
                return `cos(${expression}) = ${result}`;
            case 'sin':
                return `sin(${expression}) = ${result}`;
            case 'tan':
                return `tan(${expression}) = ${result}`;
            case 'arccos':
                return `arccos(${expression}) = ${result}`;
            case 'arcsin':
                return `arcsin(${expression}) = ${result}`;
            case 'arctan':
                return `arctan(${expression}) = ${result}`;
            case 'abs':
                return `The absolute value of ${expression} is ${result}.`;
            case 'log':
                return `log(${expression}) = ${result}`;
            case 'expand':
                return `${expression} expands to ${result}.`;
            case 'limit':
                return `The limit of ${expression} is ${result}.`;
            case 'solve':
                return `Solving ${expression} gives ${result}.`;
            default:
                return `The result of ${expression} is ${result}.`;
        }
    },

    /** Escape HTML special characters */
    _escHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }
});