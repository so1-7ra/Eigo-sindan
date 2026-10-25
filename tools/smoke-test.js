// 公開前の動作確認：全ページを開き、診断を最後まで答え、エラー・CSP違反・外部通信・保存がないか調べる
// 使い方：python3 -m http.server 8000 --directory docs を別の画面で動かしてから node tools/smoke-test.js
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const BASE = process.env.BASE || "http://localhost:8000/";

const pages = [];
(function walk(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p);
    else if (f.name === "index.html") pages.push(path.relative(path.join(__dirname, "../docs"), dir).replace(/\\/g, "/"));
  }
})(path.join(__dirname, "../docs"));

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 375, height: 800 } });
  const page = await context.newPage();
  const problems = [];
  page.on("pageerror", (e) => problems.push("JSエラー: " + e.message));
  page.on("console", (m) => { if (m.type() === "error") problems.push("コンソール: " + m.text()); });
  page.on("request", (r) => { if (!r.url().startsWith(BASE)) problems.push("外部通信: " + r.url()); });

  for (const p of pages) {
    const url = BASE + (p ? p + "/" : "");
    const res = await page.goto(url);
    if (!res.ok()) problems.push("開けない: " + url);
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    if (sw > 375) problems.push("横にはみ出し: " + url + " " + sw + "px");
  }

  // 診断：いつも最初の答え、いつも最後の答え、ランダムの3通り
  const seen = new Set();
  for (const mode of ["first", "last", "random", "random", "random"]) {
    await page.goto(BASE);
    await page.click("[data-start]");
    for (let i = 0; i < 10; i++) {
      const bs = await page.$$(".answers button");
      const j = mode === "first" ? 0 : mode === "last" ? bs.length - 1 : Math.floor(Math.random() * bs.length);
      await bs[j].click();
    }
    const name = await page.textContent(".result-name");
    const picks = await page.$$eval(".picks li", (l) => l.length);
    if (!picks) problems.push("おすすめが出ない: " + name);
    seen.add(name);
  }
  if (page.url().includes("?")) problems.push("答えがURLに出ている");

  // 計算機
  await page.goto(BASE + "calc/");
  await page.selectOption("#c-svc", "dmm");
  const per = await page.textContent("#o-per");
  if (!/円/.test(per)) problems.push("計算機の結果が出ない");

  // 比較表
  await page.goto(BASE + "compare/");
  await page.selectOption("#f-kind", "ai");
  const shown = await page.$$eval("table.compare tbody tr:not([hidden])", (r) => r.length);
  if (!shown) problems.push("比較表の絞り込みで0件");

  // 保存・Cookieがないこと
  const stored = await page.evaluate(() => localStorage.length + sessionStorage.length + document.cookie.length);
  if (stored) problems.push("ブラウザに何か保存されている");
  if ((await context.cookies()).length) problems.push("Cookieが作られている");

  console.log(pages.length + "ページ、診断結果 " + [...seen].join("・") + " を確認しました");
  console.log(problems.length ? problems.join("\n") : "問題は見つかりませんでした");
  await browser.close();
  process.exit(problems.length ? 1 : 0);
})();
