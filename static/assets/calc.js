// 料金計算機。入力はこの画面の中だけで計算し、送信も保存もしない。
(function () {
  "use strict";
  var form = document.getElementById("calc");
  if (!form || typeof DATA === "undefined") return;
  var sel = document.getElementById("c-svc");
  var monthly = document.getElementById("c-monthly");
  var count = document.getElementById("c-count");
  var min = document.getElementById("c-min");

  DATA.services.forEach(function (s) {
    if (s.monthly == null) return;
    var o = document.createElement("option");
    o.value = s.id;
    o.textContent = s.name + "（約" + s.monthly.toLocaleString("ja-JP") + "円）";
    sel.appendChild(o);
  });

  function yen(n) {
    return (n >= 100 ? Math.round(n).toLocaleString("ja-JP") : n.toFixed(1)) + "円";
  }
  function num(el) {
    var n = parseFloat(el.value);
    return isFinite(n) && n > 0 ? n : 0;
  }
  function calc() {
    var m = num(monthly), c = num(count), t = num(min);
    var ok = m && c && t;
    document.getElementById("o-per").textContent = ok ? yen(m / c) : "—";
    document.getElementById("o-min").textContent = ok ? yen(m / (c * t)) : "—";
    var total = c * t;
    document.getElementById("o-total").textContent = c && t ? (total >= 60 ? Math.floor(total / 60) + "時間" + (total % 60 ? Math.round(total % 60) + "分" : "") : Math.round(total) + "分") : "—";
  }
  sel.addEventListener("change", function () {
    var s = DATA.services.filter(function (x) { return x.id === sel.value; })[0];
    if (!s) return;
    monthly.value = s.monthly;
    if (s.lessonsPerMonth) count.value = s.lessonsPerMonth;
    if (s.minutesPerLesson) min.value = s.minutesPerLesson;
    calc();
  });
  form.addEventListener("input", calc);
  form.addEventListener("submit", function (e) { e.preventDefault(); });
  calc();
})();
