// 公開前のプライバシー・安全チェック（ブラウザを使わない静的な確認）。使い方：node tools/check.js
// docs/ のすべてのHTMLと、リポジトリ全体の秘密情報らしき文字列を調べる。
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DOCS = path.join(ROOT, "docs");
const problems = [];

function walk(dir, out = []) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    if (f.name === ".git" || f.name === "node_modules") continue;
    const p = path.join(dir, f.name);
    f.isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
}

const CSP = `default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'none'; base-uri 'none'; form-action 'none'`;
const html = walk(DOCS).filter((f) => f.endsWith(".html"));
for (const f of html) {
  const s = fs.readFileSync(f, "utf8");
  const name = path.relative(DOCS, f);
  if (!s.includes(`content="${CSP}"`)) problems.push(`${name}: CSPが決まった内容になっていない`);
  if (!s.includes('<meta name="referrer" content="no-referrer">')) problems.push(`${name}: referrer の設定がない`);
  if (!s.includes("このサイトには広告（PR）を含みます")) problems.push(`${name}: 広告表記がない`);
  if (/<script(?![^>]*\bsrc=)[^>]*>/.test(s)) problems.push(`${name}: インラインのscriptがある`);
  if (/\sstyle="/.test(s)) problems.push(`${name}: style属性がある（CSPで止まる）`);
  if (/\son[a-z]+="/.test(s)) problems.push(`${name}: onclick などのインラインイベントがある`);
  if (/<(form)[^>]*\saction=/.test(s)) problems.push(`${name}: 送信先のあるフォームがある`);
  // 外部から読み込むもの（src / link href）は一切なし
  for (const m of s.matchAll(/<(script|img|iframe|link|source|video|audio)\b[^>]*\b(?:src|href)="([^"]+)"/g)) {
    if (m[1] === "link" && /rel="canonical"/.test(m[0])) continue;
    if (/^(https?:)?\/\//.test(m[2])) problems.push(`${name}: 外部から読み込んでいる ${m[2]}`);
  }
  // 外部へのリンクは、広告なら sponsored、それ以外は noreferrer
  for (const m of s.matchAll(/<a\b[^>]*href="(https?:\/\/[^"]+)"[^>]*>/g)) {
    const tag = m[0];
    if (/rel="[^"]*sponsored/.test(tag)) {
      if (!/referrerpolicy="strict-origin"/.test(tag)) problems.push(`${name}: 広告リンクの参照元設定がない ${m[1]}`);
      if (!/>[^<]*<span class="pr">PR<\/span>/.test(s.slice(m.index, m.index + tag.length + 200))) problems.push(`${name}: 広告リンクにPR表示がない ${m[1]}`);
    } else if (!/rel="[^"]*noreferrer/.test(tag)) problems.push(`${name}: 外部リンクに noreferrer がない ${m[1]}`);
  }
}

// JSで通信・保存をしていないか
for (const f of walk(DOCS).filter((f) => f.endsWith(".js"))) {
  const s = fs.readFileSync(f, "utf8");
  for (const w of ["fetch(", "XMLHttpRequest", "sendBeacon", "WebSocket", "localStorage", "sessionStorage", "indexedDB", "document.cookie", "eval(", "new Function"]) {
    if (s.includes(w)) problems.push(`${path.relative(DOCS, f)}: ${w} を使っている`);
  }
}

// リポジトリに秘密情報らしきものが入っていないか
const SECRET = [
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, "秘密鍵"],
  [/\b(ghp|gho|github_pat)_[A-Za-z0-9_]{20,}/, "GitHubのトークン"],
  [/\bAKIA[0-9A-Z]{16}\b/, "AWSのキー"],
  [/\b(api[_-]?key|secret|password|passwd)\s*[:=]\s*["'][^"']{6,}["']/i, "パスワードやAPIキー"],
  [/\b0\d{1,4}-\d{1,4}-\d{4}\b/, "電話番号"],
  [/[A-Za-z0-9._%+-]+@(?!example\.)[A-Za-z0-9.-]+\.[a-z]{2,}/, "メールアドレス"]
];
for (const f of walk(ROOT).filter((f) => !f.includes(`${path.sep}tools${path.sep}check.js`) && /\.(js|html|css|md|json|txt|xml)$/.test(f))) {
  const s = fs.readFileSync(f, "utf8");
  for (const [re, label] of SECRET) if (re.test(s)) problems.push(`${path.relative(ROOT, f)}: ${label}らしき文字列がある`);
}
for (const f of [".env", "notes", "private"]) if (fs.existsSync(path.join(DOCS, f))) problems.push(`docs/${f} は公開してはいけない`);

console.log(html.length + "ページを確認しました");
console.log(problems.length ? problems.join("\n") : "問題は見つかりませんでした");
process.exit(problems.length ? 1 : 0);
