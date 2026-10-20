/**
 * docs/CODEMAP.md — every export in src/core, with the first sentence of its doc comment, generated from the source.
 * Claude searches it before writing any helper ("if it exists, use it"). The guardrails test fails when it is stale;
 * `pnpm codemap` rewrites it.
 *
 * Also: `duplicateExports` — the same name DEFINED in two files is a second home, and fails the build.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

/** The folders whose exports are mapped. Add yours. */
export const MAPPED = ['src/core'] as const;
const norm = (p: string) => p.split(sep).join('/');

function files(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir).sort()) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...files(full));
    else if (/\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name) && !name.endsWith('.d.ts')) out.push(full);
  }
  return out;
}

function docLine(node: ts.Node, sf: ts.SourceFile): string {
  const ranges = ts.getLeadingCommentRanges(sf.text, node.getFullStart()) ?? [];
  const doc = [...ranges].reverse().find((r) => sf.text.slice(r.pos, r.pos + 3) === '/**');
  if (!doc) return '';
  const text = sf.text.slice(doc.pos + 3, doc.end - 2).split('\n').map((l) => l.replace(/^\s*\*\s?/, '').trim()).join(' ').replace(/\s+/g, ' ').trim();
  return (text.split(/(?<=[.!?])\s/)[0] ?? text).replace(/\|/g, '\\|').slice(0, 180);
}

const exported = (n: ts.Node) => ts.canHaveModifiers(n) && (ts.getModifiers(n) ?? []).some((m) => m.kind === ts.SyntaxKind.ExportKeyword);

export function exportsOf(file: string): { name: string; kind: string; doc: string }[] {
  const sf = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
  const out: { name: string; kind: string; doc: string }[] = [];
  for (const st of sf.statements) {
    if (!exported(st)) continue;
    if (ts.isFunctionDeclaration(st) && st.name) out.push({ name: st.name.text, kind: 'fn', doc: docLine(st, sf) });
    else if (ts.isClassDeclaration(st) && st.name) out.push({ name: st.name.text, kind: 'class', doc: docLine(st, sf) });
    else if (ts.isInterfaceDeclaration(st)) out.push({ name: st.name.text, kind: 'interface', doc: docLine(st, sf) });
    else if (ts.isTypeAliasDeclaration(st)) out.push({ name: st.name.text, kind: 'type', doc: docLine(st, sf) });
    else if (ts.isVariableStatement(st)) {
      for (const d of st.declarationList.declarations) {
        if (!ts.isIdentifier(d.name)) continue;
        const isFn = !!d.initializer && (ts.isArrowFunction(d.initializer) || ts.isFunctionExpression(d.initializer));
        out.push({ name: d.name.text, kind: isFn ? 'fn' : 'const', doc: docLine(st, sf) });
      }
    }
  }
  return out;
}

/** Every export name defined (not re-exported) in more than one file — a second home. */
export function duplicateExports(root: string): { name: string; files: string[] }[] {
  const seen = new Map<string, Set<string>>();
  for (const dir of MAPPED) {
    for (const f of files(join(root, dir))) {
      for (const e of exportsOf(f)) seen.set(e.name, (seen.get(e.name) ?? new Set()).add(norm(relative(root, f))));
    }
  }
  return [...seen].filter(([, fs]) => fs.size > 1).map(([name, fs]) => ({ name, files: [...fs] })).sort((a, b) => a.name.localeCompare(b.name));
}

export function generateCodemap(root: string): string {
  const lines = [
    '# CODEMAP — what already exists',
    '',
    '**Generated — do not edit.** `pnpm codemap` rewrites it; the guardrails test fails when it is stale.',
    '**Search this before writing any export** (ADR-0001). Where each *kind* of thing lives is [`GUARDRAILS.md`](GUARDRAILS.md).',
    '',
  ];
  for (const dir of MAPPED) {
    lines.push(`## \`${dir}\``, '');
    for (const f of files(join(root, dir))) {
      const ex = exportsOf(f);
      if (!ex.length) continue;
      lines.push(`### \`${norm(relative(root, f))}\``, '');
      for (const e of ex) lines.push(`- \`${e.name}\` *${e.kind}*${e.doc ? ` — ${e.doc}` : ''}`);
      lines.push('');
    }
  }
  return lines.join('\n');
}

if (process.argv.includes('--write')) {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
  writeFileSync(join(root, 'docs', 'CODEMAP.md'), generateCodemap(root));
  console.log('docs/CODEMAP.md written');
}
