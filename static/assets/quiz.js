// 診断。答えはこの変数の中だけで使い、送信も保存もしない。
(function () {
  "use strict";
  var box = document.getElementById("quiz");
  if (!box || typeof DATA === "undefined") return;
  var Q = DATA.questions;
  var answers = [];
  var KIND = { ai: "AI英会話アプリ", human: "オンライン英会話" };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function svc(id) {
    for (var i = 0; i < DATA.services.length; i++) if (DATA.services[i].id === id) return DATA.services[i];
  }
  function sum(key) {
    return answers.reduce(function (n, a) { return n + (a[key] || 0); }, 0);
  }
  function pick(key) {
    for (var i = answers.length - 1; i >= 0; i--) if (answers[i][key] != null) return answers[i][key];
    return null;
  }

  function typeOf() {
    var talk = sum("talk"), goal = sum("goal");
    if (goal > 0) {
      if (talk < 0 || sum("test") > sum("work")) return "tsumiage";
      return "business";
    }
    return talk < 0 ? "kossori" : "oshaberi";
  }

  // タイプのおすすめを、予算・発音・時間帯の答えで並べ替える。報酬の額は使わない。
  function ranked(typeId) {
    var budget = pick("budget");
    var list = DATA.types[typeId].picks.map(function (id, i) {
      var s = svc(id), score = 10 - i * 2, why = [];
      if (budget != null && s.monthly != null) {
        if (s.monthly <= budget) { score += 3; why.push("予算内"); } else { score -= 6; }
      }
      if (sum("pron") && s.purposes.indexOf("pron") >= 0) { score += 5; why.push("発音を直せる"); }
      if (sum("anytime") && s.id === "nativecamp") { score += 3; why.push("予約なしで受けられる"); }
      return { s: s, score: score, why: why };
    });
    if (sum("pron") && !list.some(function (x) { return x.s.id === "elsa"; })) {
      list.push({ s: svc("elsa"), score: 7, why: ["発音を直せる"] });
    }
    list.sort(function (a, b) { return b.score - a.score; });
    return list.slice(0, 3);
  }

  function showQuestion() {
    var i = answers.length, q = Q[i];
    var html = '<p class="q-count">' + (i + 1) + " / " + Q.length + '</p>' +
      '<div class="q-bar"><span></span></div>' +
      "<h2 class=\"q\">" + esc(q.q) + "</h2><div class=\"answers\">";
    q.a.forEach(function (a, j) { html += '<button type="button" data-j="' + j + '">' + esc(a.t) + "</button>"; });
    html += "</div>";
    if (i > 0) html += '<button type="button" class="back" data-back="1">ひとつ戻る</button>';
    box.innerHTML = html;
    // CSPでHTMLの style 属性は使えないので、進み具合の幅はJSから設定する
    var bar = box.querySelector(".q-bar span");
    if (bar) bar.style.width = Math.round(i / Q.length * 100) + "%";
    var first = box.querySelector(".answers button");
    if (first && i > 0) first.focus();
  }

  function showResult() {
    var id = typeOf(), t = DATA.types[id];
    var html = '<p class="eyebrow">診断結果</p><h2 class="result-name">' + esc(t.name) + "</h2>" +
      '<p class="lead">' + esc(t.short) + "</p><h3>まず試すなら</h3><ol class=\"picks\">";
    ranked(id).forEach(function (x) {
      html += "<li><b>" + esc(x.s.name) + "</b><span class=\"kind kind-" + x.s.kind + "\">" + KIND[x.s.kind] + "</span>" +
        "<span class=\"pick-why\">" + esc(x.s.catch) + (x.why.length ? "（" + esc(x.why.join("・")) + "）" : "") + "</span>" +
        '<a href="service/' + x.s.id + '/">くわしく</a></li>';
    });
    html += '</ol><div class="actions"><a class="btn" href="type/' + id + '/">結果をくわしく見る</a>' +
      '<button type="button" class="btn ghost" data-again="1">最初からやり直す</button></div>';
    box.innerHTML = html;
    box.querySelector(".result-name").setAttribute("tabindex", "-1");
    box.querySelector(".result-name").focus();
  }

  function start() {
    box.innerHTML = '<button type="button" class="btn big" data-start="1">診断をはじめる</button>' +
      '<p class="note">答えはこの画面の中だけで使い、送信も保存もしません。</p>';
  }

  box.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.start) { answers = []; showQuestion(); return; }
    if (b.dataset.again) { answers = []; showQuestion(); return; }
    if (b.dataset.back) { answers.pop(); showQuestion(); return; }
    if (b.dataset.j != null) {
      answers.push(Q[answers.length].a[+b.dataset.j]);
      if (answers.length < Q.length) showQuestion(); else showResult();
    }
  });
  start();
})();
