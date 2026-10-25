// src/ と static/ から公開用の docs/ を作り直す。使い方：node tools/build.js
// 外部のライブラリは使わない（Node.js だけで動く）。
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "docs");
const CFG = require("../src/config.js");
const DATA = require("../src/data.js");

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const yen = (n) => n.toLocaleString("ja-JP") + "円";
const KIND = { ai: "AI英会話アプリ", human: "オンライン英会話" };
const svc = (id) => DATA.services.find((s) => s.id === id);

// 外部のサービスへのリンク。広告リンクには sponsored を付け、送る参照元はドメインだけにする。
// 広告でないリンクは参照元を一切送らない。
function outLink(s, label, cls) {
  const c = cls ? ` class="${cls}"` : "";
  if (s.aff) return `<a href="${esc(s.aff)}" rel="sponsored noopener" referrerpolicy="strict-origin" target="_blank"${c}>${esc(label)}<span class="pr">PR</span></a>`;
  return `<a href="${esc(s.official)}" rel="noopener noreferrer" target="_blank"${c}>${esc(label)}</a>`;
}

function price(s) {
  if (s.monthly == null) return "公式サイトで確認";
  return `${s.checked ? "" : "約"}${yen(s.monthly)}／月<small>（${esc(s.priceNote)}${s.checked ? "・" + esc(s.checked) + "確認" : "・目安"}）</small>`;
}

function card(s, r, why) {
  return `<article class="card">
  <div class="card-head"><span class="kind kind-${s.kind}">${KIND[s.kind]}</span><h3>${esc(s.name)}</h3></div>
  <p>${esc(s.catch)}</p>
  ${why ? `<p class="why">${esc(why)}</p>` : ""}
  <dl class="facts"><div><dt>料金</dt><dd>${price(s)}</dd></div><div><dt>無料体験</dt><dd>${esc(s.trial)}</dd></div></dl>
  <div class="actions">${outLink(s, "公式サイトを見る", "btn")}<a class="btn ghost" href="${r}service/${s.id}/">くわしく</a></div>
</article>`;
}

function layout({ title, description, depth, slug, body, scripts = [], noindex, absolute }) {
  // 404.html はどの深さのURLでも表示されるので、相対パスではなくサイトの根元から指す。
  const r = absolute ? (CFG.siteUrl ? CFG.siteUrl + "/" : "/") : depth ? "../".repeat(depth) : "./";
  const full = slug === "" ? `${CFG.siteName}｜AI英会話とオンライン英会話、あなたに合うのはどっち？` : `${title}｜${CFG.siteName}`;
  const canonical = CFG.siteUrl && !noindex ? `<link rel="canonical" href="${esc(CFG.siteUrl)}/${slug}">\n<meta property="og:url" content="${esc(CFG.siteUrl)}/${slug}">\n` : "";
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'none'; base-uri 'none'; form-action 'none'">
<meta name="referrer" content="no-referrer">
${noindex ? '<meta name="robots" content="noindex">\n' : ""}<title>${esc(full)}</title>
<meta name="description" content="${esc(description)}">
${canonical}<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(CFG.siteName)}">
<meta property="og:title" content="${esc(full)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:locale" content="ja_JP">
<link rel="stylesheet" href="${r}assets/style.css">
</head>
<body>
<p class="prbar">このサイトには広告（PR）を含みます。<a href="${r}about/#ads">広告について</a></p>
<header class="site"><div class="wrap">
  <a class="logo" href="${r}">${esc(CFG.siteName)}</a>
  <nav><a href="${r}#quiz">診断</a><a href="${r}compare/">比較表</a><a href="${r}calc/">料金計算</a><a href="${r}guide/">読みもの</a></nav>
</div></header>
<main class="wrap">
${body}
</main>
<footer class="site"><div class="wrap">
  <nav><a href="${r}about/">運営者情報・広告について</a><a href="${r}privacy/">プライバシーポリシー</a></nav>
  <p>料金や条件は変わることがあります。申し込む前に必ず公式サイトで確かめてください。</p>
  <p>© ${esc(CFG.siteName)}</p>
</div></footer>
${scripts.map((s) => `<script src="${r}assets/${s}"></script>`).join("\n")}
</body>
</html>
`;
}

const pages = [];
const add = (slug, html) => pages.push({ slug, html });

// トップ（診断）
add("", layout({
  slug: "", depth: 0, description: "10問に答えるだけで、AI英会話アプリとオンライン英会話のどちらが合うか、どのサービスから試すとよいかが分かる無料診断。答えはどこにも送信されません。",
  scripts: ["data.js", "quiz.js"],
  body: `<section class="hero">
  <p class="eyebrow">無料・10問・約1分</p>
  <h1>英語のやり直し、<br>AIと人、どっちから始める？</h1>
  <p class="lead">10問に答えると、あなたに合う練習のしかたと、最初に試すとよいサービスが分かります。答えはこの画面の中だけで使い、どこにも送信・保存しません。</p>
</section>
<section id="quiz" class="quiz" aria-live="polite">
  <noscript><p>診断にはJavaScriptを使います。使えない場合は、下の4つのタイプから近いものを選んでください。</p></noscript>
</section>
<section class="types">
  <h2>4つのタイプ</h2>
  <div class="type-grid">
${Object.entries(DATA.types).map(([id, t]) => `    <a class="type-link" href="type/${id}/"><b>${esc(t.name)}</b><span>${esc(t.short)}</span></a>`).join("\n")}
  </div>
</section>
<section class="more">
  <h2>自分で比べたい人へ</h2>
  <div class="more-grid">
    <a class="more-link" href="compare/"><b>比較表</b><span>種類・目的・予算で${DATA.services.length}社を絞り込む</span></a>
    <a class="more-link" href="calc/"><b>料金計算機</b><span>1レッスン・1分あたりの料金を出す</span></a>
  </div>
</section>`
}));

// 診断の結果タイプ
for (const [id, t] of Object.entries(DATA.types)) {
  const r = "../../";
  add(`type/${id}/`, layout({
    slug: `type/${id}/`, depth: 2, title: t.name, description: `${t.name}：${t.short}。おすすめのサービスと始め方。`,
    body: `<p class="crumb"><a href="${r}">診断</a> ＞ 結果</p>
<section class="result-head">
  <p class="eyebrow">あなたは</p>
  <h1>${esc(t.name)}</h1>
  <p class="lead">${esc(t.text)}</p>
</section>
<section>
  <h2>始め方</h2>
  <ol class="steps">${t.start.map((x) => `<li>${esc(x)}</li>`).join("")}</ol>
</section>
<section>
  <h2>このタイプに合うサービス</h2>
  <div class="cards">${t.picks.map((p) => card(svc(p), r)).join("\n")}</div>
</section>
<section class="share">
  <a class="btn ghost" href="https://x.com/intent/post?text=${encodeURIComponent(`英語やり直し診断の結果は「${t.name}」でした`)}${CFG.siteUrl ? "&amp;url=" + encodeURIComponent(CFG.siteUrl + "/type/" + id + "/") : ""}" rel="noopener noreferrer" target="_blank">結果をXでシェア</a>
  <a class="btn ghost" href="${r}#quiz">もう一度診断する</a>
</section>`
  }));
}

// サービス紹介
for (const s of DATA.services) {
  const r = "../../";
  add(`service/${s.id}/`, layout({
    slug: `service/${s.id}/`, depth: 2, title: `${s.name}の特徴と向いている人`, description: `${s.name}（${KIND[s.kind]}）の料金の目安、無料体験、向いている人・向いていない人を公式情報をもとにまとめました。`,
    body: `<p class="crumb"><a href="${r}compare/">比較表</a> ＞ ${esc(s.name)}</p>
<section class="result-head">
  <p class="eyebrow">${KIND[s.kind]}</p>
  <h1>${esc(s.name)}</h1>
  <p class="lead">${esc(s.catch)}。</p>
</section>
<section>
  <dl class="facts big"><div><dt>料金</dt><dd>${price(s)}</dd></div><div><dt>無料体験</dt><dd>${esc(s.trial)}</dd></div></dl>
  <p class="note">${esc(s.trialNote)}</p>
</section>
<section class="two">
  <div><h2>向いている人</h2><ul>${s.goodFor.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>
  <div><h2>向いていない人</h2><ul>${s.notFor.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>
</section>
<section class="cta">${outLink(s, `${s.name}の公式サイトを見る`, "btn")}</section>
<section class="source">
  <h2>この情報について</h2>
  <p>このページは${esc(s.name)}の公式サイトの情報をもとにまとめたもので、運営者が実際に試した体験談ではありません。${s.checked ? `料金は${esc(s.checked)}に確認しました。` : "料金は目安です。"}最新の料金と条件は公式サイトで確かめてください。</p>
</section>`
  }));
}

// 比較表
{
  const r = "../";
  const rows = DATA.services.map((s) => `<tr data-kind="${s.kind}" data-purposes="${s.purposes.join(" ")}" data-monthly="${s.monthly == null ? "" : s.monthly}">
  <th scope="row"><a href="${r}service/${s.id}/">${esc(s.name)}</a></th>
  <td>${KIND[s.kind]}</td><td class="num">${price(s)}</td><td>${esc(s.trial)}</td><td>${esc(s.catch)}</td>
  <td>${outLink(s, "公式サイト")}</td></tr>`).join("\n");
  add("compare/", layout({
    slug: "compare/", depth: 1, title: "AI英会話・オンライン英会話 比較表", description: `AI英会話アプリとオンライン英会話${DATA.services.length}社を、種類・目的・予算で絞り込んで比べられる比較表。`,
    scripts: ["compare.js"],
    body: `<section class="result-head">
  <h1>比較表</h1>
  <p class="lead">種類・目的・予算で絞り込めます。料金は目安なので、申し込む前に公式サイトで確かめてください。</p>
</section>
<form class="filters" id="filters" aria-label="絞り込み">
  <label>種類<select id="f-kind"><option value="">すべて</option><option value="ai">AI英会話アプリ</option><option value="human">オンライン英会話</option></select></label>
  <label>目的<select id="f-purpose"><option value="">すべて</option><option value="daily">日常・旅行</option><option value="work">仕事</option><option value="test">試験</option><option value="pron">発音</option></select></label>
  <label>月の予算<select id="f-budget"><option value="">こだわらない</option><option value="2000">2,000円まで</option><option value="5000">5,000円まで</option><option value="10000">1万円まで</option></select></label>
</form>
<p class="note" id="f-count" aria-live="polite"></p>
<div class="tablebox"><table class="compare">
<thead><tr><th scope="col">サービス</th><th scope="col">種類</th><th scope="col">料金</th><th scope="col">無料体験</th><th scope="col">特徴</th><th scope="col">リンク</th></tr></thead>
<tbody>
${rows}
</tbody></table></div>
<p class="note">「公式サイトで確認」のサービスは、予算で絞り込んだときも表示したままにしています。</p>`
  }));
}

// 料金計算機
add("calc/", layout({
  slug: "calc/", depth: 1, title: "英会話 料金計算機", description: "月額料金と使う回数から、1レッスンあたり・1分あたりの料金を計算。入力した数字はどこにも送信されません。",
  scripts: ["data.js", "calc.js"],
  body: `<section class="result-head">
  <h1>料金計算機</h1>
  <p class="lead">月額料金と、実際に使う回数・時間を入れると、1回あたり・1分あたりの料金が出ます。入力した数字はこの画面の中だけで計算し、どこにも送信・保存しません。</p>
</section>
<form class="calc" id="calc" aria-label="料金の計算">
  <label>サービス<select id="c-svc"><option value="">自分で入力する</option></select></label>
  <label>月額料金（円）<input id="c-monthly" type="number" inputmode="numeric" min="0" step="10" value="7480"></label>
  <label>月に使う回数<input id="c-count" type="number" inputmode="numeric" min="1" step="1" value="20"></label>
  <label>1回あたりの時間（分）<input id="c-min" type="number" inputmode="numeric" min="1" step="1" value="25"></label>
</form>
<div class="calc-out" aria-live="polite">
  <div><span>1回あたり</span><b id="o-per">—</b></div>
  <div><span>1分あたり</span><b id="o-min">—</b></div>
  <div><span>月に話す時間</span><b id="o-total">—</b></div>
</div>
<p class="note">AI英会話アプリは使い放題のものが多いので、「実際に使う回数」で割ると本当のコストが見えます。オンライン英会話は、受けなかったレッスンの分だけ1回あたりが高くなります。</p>`
}));

// 読みもの
const articles = fs.readdirSync(path.join(ROOT, "src/articles")).filter((f) => f.endsWith(".html")).sort().map((f) => {
  const raw = fs.readFileSync(path.join(ROOT, "src/articles", f), "utf8");
  const m = raw.match(/^<!--\s*(\{[\s\S]*?\})\s*-->\n?/);
  if (!m) throw new Error(f + " の先頭に設定がありません");
  return { ...JSON.parse(m[1]), body: raw.slice(m[0].length) };
}).filter((a) => !a.draft);
for (const a of articles) {
  const r = "../../";
  const body = a.body.replace(/\{\{root\}\}/g, r).replace(/\{\{card:([a-z]+)\}\}/g, (_, id) => card(svc(id), r));
  add(`guide/${a.slug}/`, layout({
    slug: `guide/${a.slug}/`, depth: 2, title: a.title, description: a.description,
    body: `<p class="crumb"><a href="${r}guide/">読みもの</a></p>
<article class="article">
<h1>${esc(a.title)}</h1>
<p class="meta">更新：${esc(a.updated)}</p>
${body}
<aside class="next"><p>自分にどちらが合うか迷ったら、10問の診断で確かめられます。</p><a class="btn" href="${r}#quiz">診断してみる</a></aside>
</article>`
  }));
}
add("guide/", layout({
  slug: "guide/", depth: 1, title: "読みもの", description: "英語をやり直したい大人のための、学び方とサービス選びの読みもの。",
  body: `<section class="result-head"><h1>読みもの</h1></section>
<ul class="guide-list">${articles.map((a) => `<li><a href="${a.slug}/"><b>${esc(a.title)}</b><span>${esc(a.description)}</span></a></li>`).join("")}</ul>`
}));

// 運営者情報・広告について
add("about/", layout({
  slug: "about/", depth: 1, title: "運営者情報・広告について", description: `${CFG.siteName}の運営者と、広告の掲載方針について。`,
  body: `<article class="article">
<h1>運営者情報・広告について</h1>
<h2>運営者</h2>
<dl class="facts"><div><dt>サイト名</dt><dd>${esc(CFG.siteName)}</dd></div><div><dt>運営者</dt><dd>${esc(CFG.operator)}</dd></div><div><dt>お問い合わせ</dt><dd>${CFG.contact ? esc(CFG.contact) : "準備中"}</dd></div></dl>
<h2 id="ads">広告について</h2>
<p>このサイトは、アフィリエイトプログラム（成果報酬型の広告）で運営しています。サービスへのリンクの一部は広告リンクで、そこから申し込みがあると運営者に報酬が支払われます。広告リンクには「PR」と表示しています。</p>
<p>報酬の有無や金額によって、診断の結果や比較表の順番を変えることはありません。診断の結果は、答えの内容だけで決まります。</p>
<h2>情報の正確さについて</h2>
<p>料金や無料体験の条件は、各サービスの公式サイトの情報をもとにしています。実際に試していないサービスは、その旨をページに書いています。条件は変わることがあるので、申し込む前に必ず公式サイトで確かめてください。</p>
<p>最終更新：${esc(CFG.updated)}</p>
</article>`
}));

// プライバシーポリシー
add("privacy/", layout({
  slug: "privacy/", depth: 1, title: "プライバシーポリシー", description: `${CFG.siteName}のプライバシーポリシー。`,
  body: `<article class="article">
<h1>プライバシーポリシー</h1>
<p>このサイトは、訪れた人の個人情報を集めません。</p>
<h2>このサイトが集めないもの</h2>
<ul>
<li>診断の答えや料金計算機に入れた数字は、ブラウザの中だけで計算し、どこにも送信しません。端末にも保存しません。</li>
<li>Cookie、ブラウザの保存領域（localStorage など）は使いません。</li>
<li>アクセス解析ツール、広告配信ツール、外部のフォントや画像は読み込みません。ページを開いただけで外部と通信することはありません。</li>
<li>入力フォームやコメント欄はありません。</li>
</ul>
<h2>広告リンクを押したとき</h2>
<p>「PR」と表示されたリンクを押すと、アフィリエイトサービス（ASP）を経由して各サービスのサイトへ移動します。このとき、ASPや移動先のサイトが、成果の計測のためにCookieなどを使うことがあります。その扱いは各社のプライバシーポリシーに従います。このサイトから送る参照元の情報は、サイトのドメインだけです（どのページから来たかは送りません）。</p>
<h2>サーバーの記録</h2>
<p>このサイトはGitHub Pagesで公開しています。GitHubは、安全な運用のためにアクセス元のIPアドレスなどを記録することがあります。詳しくはGitHubのプライバシーに関する説明をご覧ください。運営者はこの記録を見ることができません。</p>
<h2>変更</h2>
<p>この方針を変えるときは、このページを更新します。</p>
<p>最終更新：${esc(CFG.updated)}</p>
</article>`
}));

// 見つからないページ
add("404.html", layout({ slug: "404.html", depth: 0, noindex: true, absolute: true, title: "ページが見つかりません", description: "ページが見つかりません。", body: `<section class="result-head"><h1>ページが見つかりません</h1><p class="lead">URLが変わったか、ページが削除された可能性があります。</p><p><a class="btn" href="${CFG.siteUrl ? esc(CFG.siteUrl) + "/" : "/"}">トップへ戻る</a></p></section>` }));

// 書き出し
fs.rmSync(OUT, { recursive: true, force: true });
fs.cpSync(path.join(ROOT, "static"), OUT, { recursive: true });
fs.copyFileSync(path.join(ROOT, "src/data.js"), path.join(OUT, "assets/data.js"));
for (const p of pages) {
  const file = p.slug.endsWith(".html") ? path.join(OUT, p.slug) : path.join(OUT, p.slug, "index.html");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, p.html);
}
fs.writeFileSync(path.join(OUT, ".nojekyll"), "");
if (CFG.siteUrl) {
  const urls = pages.filter((p) => !p.slug.endsWith(".html")).map((p) => `  <url><loc>${CFG.siteUrl}/${p.slug}</loc></url>`).join("\n");
  fs.writeFileSync(path.join(OUT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
  fs.writeFileSync(path.join(OUT, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${CFG.siteUrl}/sitemap.xml\n`);
} else {
  fs.writeFileSync(path.join(OUT, "robots.txt"), "User-agent: *\nAllow: /\n");
  console.log("注意：src/config.js の siteUrl が空なので、canonical と sitemap.xml は出していません。");
}
console.log(pages.length + "ページを docs/ に書き出しました");
