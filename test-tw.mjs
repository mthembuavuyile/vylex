import { compile } from '@tailwindcss/node';
import { Scanner } from '@tailwindcss/oxide';
import fs from 'fs';
import path from 'path';

const inputCss = fs.readFileSync('css/input.css', 'utf-8');
const base = path.resolve('css');
const f = await compile(inputCss, { from: 'css/input.css', base, onDependency: () => {} });
console.log('f.root:', f.root);
console.log('f.sources:', f.sources);

const rootSources = (f.root === "none" ? [] : f.root === null ? [{ base: process.cwd(), pattern: "**/*", negated: false }] : [{ ...f.root, negated: false }]).concat(f.sources);
console.log('rootSources:', rootSources);

const scanner = new Scanner({ sources: rootSources });
const candidates = scanner.scan();
console.log('Candidates count:', candidates.length);
console.log('Has space-x-6?', candidates.includes('space-x-6'));
const builtCss = f.build(candidates);
console.log('builtCss length:', builtCss.length);
console.log('builtCss has space-x-6:', builtCss.includes('space-x-6'));
