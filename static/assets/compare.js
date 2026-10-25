// 比較表の絞り込み。表の行は最初からHTMLにあり、ここでは表示・非表示を切り替えるだけ。
(function () {
  "use strict";
  var form = document.getElementById("filters");
  if (!form) return;
  var rows = Array.prototype.slice.call(document.querySelectorAll("table.compare tbody tr"));
  var count = document.getElementById("f-count");

  function apply() {
    var kind = form.querySelector("#f-kind").value;
    var purpose = form.querySelector("#f-purpose").value;
    var budget = form.querySelector("#f-budget").value;
    var shown = 0;
    rows.forEach(function (tr) {
      var ok = true;
      if (kind && tr.dataset.kind !== kind) ok = false;
      if (purpose && tr.dataset.purposes.split(" ").indexOf(purpose) < 0) ok = false;
      // 料金が分からないサービスは、予算で外さない
      if (budget && tr.dataset.monthly && +tr.dataset.monthly > +budget) ok = false;
      tr.hidden = !ok;
      if (ok) shown++;
    });
    count.textContent = shown + "件を表示しています";
  }
  form.addEventListener("change", apply);
  form.addEventListener("submit", function (e) { e.preventDefault(); });
  apply();
})();
