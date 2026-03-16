// js/api/math.js
// Newton Math API module for Nexora AI
// Supports: arithmetic, algebra, calculus, trigonometry — conversational & direct input

window.NexoraRegistry.register({
    id: 'math',
    name: 'Newton Math API',
    example: 'what is the derivative of x^2',

    intents: [
        /^(simplify|factor|derive|integrate|zeroes|tangent|area|cos|sin|tan|arccos|arcsin|arctan|abs|log|expand|limit)\s+(.+)$/i,
        /^(?:what(?:'s|\s+is)?|find(?:\s+the)?|calculate(?:\s+the)?|compute(?:\s+the)?|solve(?:\s+the)?)\s+(?:the\s+)?(derivative|integral|limit|factorization|zeroes|simplification)\s*(?:of\s+)?(.+?)[\?\.]*$/i,
        /^solve\s+(.+)$/i,
        /^(?:what(?:'s|\s+is)\s+)?(sin|cos|tan|arcsin|arccos|arctan)\s*\(?\s*([-\d\.]+)\s*\)?[\?\.]*$/i,
        /^[\d\s\+\-\*\/\(\)\.]+$/,
        /^[a-zA-Z\d\s\+\-\*\/\(\)\.\^\=]+$(?=.*[\+\-\*\/\^\=])/
    ],

    _nonMathPhrases: [
        /^(hi|hello|hey|thanks|ok|okay|yes|no|bye|help|please)/i,
        /^(who|where|when|why|how\s+(?!much|many))/i,
        /^(show|tell|give|get|open|close|start|stop|what\s+(?!is\s*[\d\(]))/i,
        /\b(weather|news|crypto|bitcoin|joke|bible|verse|reddit|define|meaning|translate)\b/i,
    ],

    _isMathExpression(str) {
        const hasMathContent = /\d/.test(str) || /\b(sin|cos|tan|log|sqrt|pi|x|y)\b/i.test(str);
        const hasOperator = /[\+\-\*\/\^\=\(\)]/.test(str);
        return hasMathContent && hasOperator;
    },

    async handle(match, appState = {}) {
        let rawOperation = 'simplify';
        let expression = '';
        const fullMatch = (match[0] || '').trim();

        // ── Guard: reject plain English ────────────────────────────────────
        for (const pattern of this._nonMathPhrases) {
            if (pattern.test(fullMatch)) return null; 
        }

        // ── Route Intents ──────────────────────────────────────────────────
        if (/^solve\s+/i.test(fullMatch)) {
            rawOperation = 'solve';
            expression = fullMatch.replace(/^solve\s+/i, '').trim();
        }
        else if (/^(?:what(?:'s|\s+is)\s+)?(sin|cos|tan|arcsin|arccos|arctan)\s*\(?/i.test(fullMatch)) {
            const m = fullMatch.match(/^(?:what(?:'s|\s+is)\s+)?(sin|cos|tan|arcsin|arccos|arctan)\s*\(?\s*([-\d\.]+)/i);
            rawOperation = m ? m[1].toLowerCase() : 'simplify';
            expression   = m ? m[2] : '';
        }
        else if (/^(?:what(?:'s|\s+is)?|find|calculate|compute|what\s+is)\s+(?:the\s+)?(derivative|integral|limit|factorization|zeroes|simplification)\b/i.test(fullMatch)) {
            const m = fullMatch.match(/(?:the\s+)?(derivative|integral|limit|factorization|zeroes|simplification)\s+(?:of\s+)?(.+?)[\?\.]*$/i);
            const opWord = m ? m[1].toLowerCase() : '';
            expression   = m ? m[2].trim() : '';
            const nlMap = {
                'derivative': 'derive', 'integral': 'integrate',
                'factorization': 'factor', 'simplification': 'simplify',
                'zeroes': 'zeroes', 'limit': 'limit'
            };
            rawOperation = nlMap[opWord] || 'simplify';
        }
        else if (/^(?:what(?:'s|\s+is)?|find|calculate|compute)\s+/i.test(fullMatch)) {
            expression = fullMatch.replace(/^(?:what(?:'s|\s+is)?|find\s+(?:the\s+)?|calculate\s+|compute\s+)/i, '').replace(/[\?\.]*$/, '').trim();
            rawOperation = 'simplify';
            if (!this._isMathExpression(expression)) return null;
        }
        else if (/^(simplify|factor|derive|integrate|zeroes|tangent|area|cos|sin|tan|arccos|arcsin|arctan|abs|log|expand|limit)\s+/i.test(fullMatch)) {
            const m = fullMatch.match(/^(\w+)\s+(.+)$/i);
            rawOperation = m ? m[1].toLowerCase() : 'simplify';
            expression   = m ? m[2].trim() : '';
        }
        else {
            if (!this._isMathExpression(fullMatch)) return null;
            rawOperation = 'simplify';
            expression   = fullMatch;
        }

        // ── Normalise expression ───────────────────────────────────────────
        expression = (expression || '').trim()
            .replace(/\s*=\s*$/, '')    
            .replace(/×/g, '*')         
            .replace(/÷/g, '/');        

        if (!expression) {
            return { text: "Hmm, I didn't catch the expression. Could you rephrase? E.g. \"derive x^2\" or \"what is 6 + 8\"." };
        }

        // FIX 1: Convert equations for the Newton API
        // Transforms "2x - 8 = 0" into "2x - 8" OR "2x = 8" into "(2x) - (8)"
        if (expression.includes('=')) {
            const parts = expression.split('=');
            if (parts.length === 2) {
                const lhs = parts[0].trim();
                const rhs = parts[1].trim();
                expression = (rhs === '0') ? lhs : `(${lhs})-(${rhs})`;
                if (rawOperation === 'simplify') rawOperation = 'solve';
            } else {
                return { text: "Hmm, that equation has too many equals signs. Try something like '2x = 8'." };
            }
        }

        if (!this._isMathExpression(expression) && !/^[\d\s\+\-\*\/\(\)\.]+$/.test(expression)) {
            return null;
        }

        const opMap = {
            'derivative': 'derive', 'integral': 'integrate',
            'factor': 'factor', 'factorize': 'factor',
            'simplify': 'simplify', 'calculate': 'simplify', 'compute': 'simplify'
        };
        const apiOperation = opMap[rawOperation] || rawOperation;

        // ── FIX 2: Evaluate Arithmetic & Degrees Trig Locally ──────────────
        const localResult = this._localEval(apiOperation, expression);
        if (localResult !== null) {
            return this._formatResponse(apiOperation, expression, localResult);
        }

        // ── Fetch from Newton API ──────────────────────────────────────────
        try {
            const encodedExpression = encodeURIComponent(expression);
            const res = await fetch(`https://newton.now.sh/api/v2/${apiOperation}/${encodedExpression}`);

            if (!res.ok) throw new Error(`Newton API returned ${res.status}`);
            const data = await res.json();

            if (!data || data.result === undefined || data.error) {
                return { text: `Hmm, I couldn't compute "${expression}". Double-check the formatting — for example, use "^" for exponents like x^2, and "*" for multiplication.` };
            }

            return this._formatResponse(apiOperation, data.expression, data.result);

        } catch (err) {
            console.error('[Math Plugin]', err);
            if (err.message && err.message.includes('400')) {
                return { text: `I couldn't process "${expression}". Try rephrasing — for example, "x^2 + 2x" instead of "x² + 2x".` };
            }
            return { text: "My math solver is having a moment. Please try again shortly." };
        }
    },

    // ── Local Evaluator for Math & Degrees ─────────────────────────────────
    _localEval(op, expr) {
        // Pure arithmetic
        if (op === 'simplify' && /^[\d\s\+\-\*\/\(\)\.]+$/.test(expr)) {
            try {
                const result = Function(`"use strict"; return (${expr})`)();
                return Math.round(result * 100000) / 100000;
            } catch(e) { return null; }
        }

        // Trig (Uses Degrees instead of API Radians)
        const num = parseFloat(expr);
        if (/^[\d\.\-]+$/.test(expr) && !isNaN(num)) {
            const rad = num * (Math.PI / 180);
            let res = null;
            
            if (op === 'sin') res = Math.sin(rad);
            if (op === 'cos') res = Math.cos(rad);
            if (op === 'tan') {
                if (num % 180 === 90 || num % 180 === -90) return "Undefined";
                res = Math.tan(rad);
            }
            if (op === 'arcsin') res = Math.asin(num) * (180 / Math.PI);
            if (op === 'arccos') res = Math.acos(num) * (180 / Math.PI);
            if (op === 'arctan') res = Math.atan(num) * (180 / Math.PI);
            
            if (res !== null) {
                if (isNaN(res)) return "Undefined";
                return Math.round(res * 10000) / 10000; // Round nicely
            }
        }
        return null;
    },

    // ── UI Builder ─────────────────────────────────────────────────────────
    _formatResponse(op, expr, result) {
        const opLabel = this._opLabel(op);
        const conversationalText = this._buildReply(op, expr, result);
        
        const html = `
        <div class="rich-widget">
            <div class="widget-title">
                <i class="fas fa-calculator"></i> ${opLabel}
            </div>
            <div class="math-main" style="padding:12px;background:var(--surface2, var(--bg-secondary, #f4f4f4));border-radius:8px;margin-top:8px;">
                <div style="font-size:0.85em;opacity:0.75;margin-bottom:4px;">
                    Expression: <strong>${this._escHtml(expr)}</strong>
                </div>
                <div style="font-size:1.3em;font-family:'DM Mono',monospace;color:var(--primary, var(--accent-color, #4361ee));font-weight:500;">
                    = ${this._escHtml(String(result))}
                </div>
            </div>
        </div>`;

        if (window.MathJax) setTimeout(() => MathJax.typesetPromise(), 100);

        return { html, text: conversationalText };
    },

    // ── Helpers ────────────────────────────────────────────────────────────
    _opLabel(op) {
        const labels = {
            simplify:'Simplify', factor:'Factor', derive:'Derivative', integrate:'Integral', zeroes:'Zeroes', tangent:'Tangent',
            area:'Area', cos:'cos', sin:'sin', tan:'tan', arccos:'arccos', arcsin:'arcsin', arctan:'arctan',
            abs:'Absolute Value', log:'Logarithm', expand:'Expand', limit:'Limit', solve:'Solve'
        };
        return labels[op] || op.charAt(0).toUpperCase() + op.slice(1);
    },

    _buildReply(op, expression, result) {
        const map = {
            simplify:  `${expression} simplifies to ${result}.`,
            derive:    `The derivative of ${expression} is ${result}.`,
            integrate: `The integral of ${expression} is ${result}.`,
            factor:    `${expression} factors to ${result}.`,
            zeroes:    `The zeroes of ${expression} are at ${result}.`,
            tangent:   `The tangent of ${expression} is ${result}.`,
            area:      `The area under ${expression} is ${result}.`,
            cos:       `cos(${expression}) = ${result}`,
            sin:       `sin(${expression}) = ${result}`,
            tan:       `tan(${expression}) = ${result}`,
            arccos:    `arccos(${expression}) = ${result}`,
            arcsin:    `arcsin(${expression}) = ${result}`,
            arctan:    `arctan(${expression}) = ${result}`,
            abs:       `The absolute value of ${expression} is ${result}.`,
            log:       `log(${expression}) = ${result}`,
            expand:    `${expression} expands to ${result}.`,
            limit:     `The limit of ${expression} is ${result}.`,
            solve:     `Solving ${expression} gives ${result}.`
        };
        return map[op] || `The result of ${expression} is ${result}.`;
    },

    _escHtml(str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
});