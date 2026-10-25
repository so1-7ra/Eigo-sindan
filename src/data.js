// サイト全体で使うデータ。ビルド時に docs/assets/data.js へコピーされ、ブラウザでも読まれる。
// 料金や無料体験の条件はここだけを直せば、診断・計算機・比較表・紹介ページのすべてに反映される。
// aff：ASPの広告リンク（審査が通ったら貼る）。空のあいだは公式サイトへの普通のリンクになる。
// checked：公式サイトで料金を確かめた日。空のあいだは「目安」と表示する。
var DATA = {
  services: [
    {
      id: "speak", name: "Speak", kind: "ai",
      monthly: 1650, priceNote: "年払いの月あたり",
      trial: "7日間無料", trialNote: "登録時に支払い方法の入力が必要な場合あり。期間内に解約すれば料金はかからない。",
      purposes: ["daily", "work"],
      catch: "AI相手に声を出して話す練習ができる",
      goodFor: ["人と話すのはまだ恥ずかしい", "スキマ時間に毎日少しずつ話したい", "言い回しをその場で直してほしい"],
      notFor: ["人間の講師と話したい", "TOEICの点数を上げたい"],
      official: "https://www.speak.com/ja", aff: "", checked: ""
    },
    {
      id: "speakbuddy", name: "スピークバディ", kind: "ai",
      monthly: 2200, priceNote: "月払い",
      trial: "3日間無料", trialNote: "無料期間の長さはプランや時期で変わることがある。",
      purposes: ["daily"],
      catch: "キャラクターとの会話で、初心者でも続けやすい",
      goodFor: ["中学英語から不安", "ゲーム感覚で続けたい", "決まった流れで練習したい"],
      notFor: ["自由に長く話したい", "ビジネス英語を優先したい"],
      official: "https://www.speakbuddy.jp/", aff: "", checked: ""
    },
    {
      id: "studysapuri", name: "スタディサプリENGLISH", kind: "ai",
      monthly: 2178, priceNote: "コースにより異なる",
      trial: "7日間無料", trialNote: "コースごとに料金と無料体験の条件が違う。",
      purposes: ["daily", "test"],
      catch: "動画講義とドリルで、文法から積み上げられる",
      goodFor: ["基礎からやり直したい", "TOEICの点数も上げたい", "自分のペースで進めたい"],
      notFor: ["すぐに話す練習をたくさんしたい"],
      official: "https://eigosapuri.jp/", aff: "", checked: ""
    },
    {
      id: "elsa", name: "ELSA Speak", kind: "ai",
      monthly: 1000, priceNote: "年払いの月あたり",
      trial: "7日間無料", trialNote: "無料プランでも一部の練習ができる。",
      purposes: ["pron"],
      catch: "AIが発音を音ごとに採点して直してくれる",
      goodFor: ["発音に自信がない", "通じない原因を知りたい", "1回5分から始めたい"],
      notFor: ["会話の流れを練習したい"],
      official: "https://elsaspeak.com/ja/", aff: "", checked: ""
    },
    {
      id: "dmm", name: "DMM英会話", kind: "human",
      monthly: 7480, priceNote: "毎日1レッスン（25分）のプラン",
      trial: "無料体験2回", trialNote: "無料体験の回数や条件は時期で変わることがある。",
      purposes: ["daily", "work"],
      catch: "講師の国籍が多く、教材も豊富",
      goodFor: ["人と話す練習をしたい", "いろいろな国の講師と話したい", "毎日決まった時間に話したい"],
      notFor: ["人と話すのがまだ怖い", "月の予算を3,000円以内にしたい"],
      official: "https://eikaiwa.dmm.com/", aff: "", checked: "",
      lessonsPerMonth: 30, minutesPerLesson: 25
    },
    {
      id: "rarejob", name: "レアジョブ英会話", kind: "human",
      monthly: null, priceNote: "プランにより異なる",
      trial: "無料体験あり", trialNote: "条件は公式サイトで確認。",
      purposes: ["work", "daily"],
      catch: "ビジネス英会話のコースがある",
      goodFor: ["仕事で英語を使う", "日本人カウンセラーに相談したい"],
      notFor: ["予約なしで好きなときに話したい"],
      official: "https://www.rarejob.com/", aff: "", checked: ""
    },
    {
      id: "nativecamp", name: "ネイティブキャンプ", kind: "human",
      monthly: null, priceNote: "プランにより異なる",
      trial: "無料体験あり", trialNote: "条件は公式サイトで確認。",
      purposes: ["daily"],
      catch: "予約なしで、話したいときにすぐレッスンを受けられる",
      goodFor: ["時間が不規則", "たくさん話して慣れたい", "朝や深夜に練習したい"],
      notFor: ["毎回同じ講師に決めて習いたい"],
      official: "https://nativecamp.net/", aff: "", checked: ""
    },
    {
      id: "bizmates", name: "Bizmates", kind: "human",
      monthly: null, priceNote: "プランにより異なる",
      trial: "無料体験あり", trialNote: "条件は公式サイトで確認。",
      purposes: ["work"],
      catch: "ビジネス経験のある講師と、仕事の場面を練習できる",
      goodFor: ["会議やメールで英語を使う", "仕事の場面に絞って練習したい"],
      notFor: ["旅行や趣味の英語が目的"],
      official: "https://www.bizmates.jp/", aff: "", checked: ""
    }
  ],

  // 診断の結果タイプ。talk：負＝一人で練習、正＝講師と話す。goal：負＝日常・趣味、正＝仕事・試験。
  types: {
    kossori: {
      name: "こっそり練習タイプ", short: "まずはAI相手に、人目を気にせず話す練習から",
      text: "英語を話してみたい気持ちはあるけれど、人前で間違えるのはまだ恥ずかしい。そんなあなたには、AI英会話アプリが合っています。AIは何度聞き返しても嫌な顔をしません。まずは1日10分、声に出すことに慣れましょう。",
      start: ["無料体験のあいだに毎日1回は声を出す", "最初の1週間は自己紹介と日常の一言だけで十分", "慣れてきたらオンライン英会話の無料体験を1回だけ受けてみる"],
      picks: ["speak", "speakbuddy", "elsa"]
    },
    tsumiage: {
      name: "コツコツ積み上げタイプ", short: "基礎と試験対策を、自分のペースで積み上げる",
      text: "話す練習よりも先に、文法や語彙の土台を固めたいタイプです。動画講義とドリルで基礎を積み上げ、TOEICなどの点数で成長を確かめると続けやすくなります。",
      start: ["最初に今の実力を測る（無料の診断テストなど）", "1日15分、同じ時間に学習する", "1か月ごとに点数や正答率を記録する"],
      picks: ["studysapuri", "elsa", "speak"]
    },
    business: {
      name: "ビジネス実戦タイプ", short: "仕事の場面を想定して、講師と話す練習をする",
      text: "会議やメールなど、仕事で英語を使う場面がはっきりしているタイプです。ビジネスに強いオンライン英会話で、実際に使う場面を講師と練習するのが近道です。",
      start: ["使う場面（会議・電話・メール）を3つ書き出す", "無料体験で、その場面のレッスンがあるか確かめる", "週3回以上、決まった時間に予約する"],
      picks: ["bizmates", "rarejob", "dmm"]
    },
    oshaberi: {
      name: "おしゃべり実践タイプ", short: "とにかくたくさん人と話して慣れる",
      text: "間違えても気にせず、まずは話してみたいタイプです。オンライン英会話で、人と話す回数を増やすのがいちばんの近道です。予約なしで受けられるサービスなら、空いた時間をそのまま練習に使えます。",
      start: ["無料体験で2〜3社を比べ、話しやすい講師を見つける", "最初は毎回同じ教材で慣れる", "言えなかった表現をメモして次のレッスンで使う"],
      picks: ["nativecamp", "dmm", "speak"]
    }
  },

  // 診断の質問。各選択肢の talk / goal が点数。budget / time / level / pron は結果の並び順に使う。
  questions: [
    { q: "英語を話すとき、一番近い気持ちは？", a: [
      { t: "恥ずかしくて声が出ない", talk: -2 },
      { t: "緊張するけれど話してみたい", talk: 1 },
      { t: "特に気にならない", talk: 2 } ] },
    { q: "英語を使いたい場面は？", a: [
      { t: "旅行や映画、趣味", goal: -2 },
      { t: "仕事の会議やメール", goal: 2, work: 1 },
      { t: "TOEICなどの試験", goal: 2, test: 1 } ] },
    { q: "いまの英語力は？", a: [
      { t: "中学英語から不安", level: 0, talk: -1 },
      { t: "簡単なあいさつならできる", level: 1 },
      { t: "日常会話なら少しできる", level: 2, talk: 1 } ] },
    { q: "1日に使える時間は？", a: [
      { t: "10分くらい", time: 0, talk: -1 },
      { t: "15〜30分", time: 1 },
      { t: "1時間以上", time: 2, talk: 1 } ] },
    { q: "学習する時間帯は決まっている？", a: [
      { t: "ばらばら", talk: -1, anytime: 1 },
      { t: "だいたい決まっている", talk: 1 } ] },
    { q: "月にかけられる予算は？", a: [
      { t: "2,000円まで", budget: 2000, talk: -1 },
      { t: "5,000円まで", budget: 5000 },
      { t: "1万円まで", budget: 10000, talk: 1 } ] },
    { q: "間違えたとき、どうしてほしい？", a: [
      { t: "その場ですぐ直してほしい", talk: 1 },
      { t: "あとでまとめて知りたい", talk: -1 } ] },
    { q: "いちばん気になっていることは？", a: [
      { t: "発音が通じるか", pron: 1 },
      { t: "言いたい単語が出てこない" },
      { t: "相手の英語が聞き取れない", talk: 1 } ] },
    { q: "続けるために大事なのは？", a: [
      { t: "ゲームのような楽しさ", talk: -1, goal: -1 },
      { t: "人との約束", talk: 2 },
      { t: "点数や成績が見えること", goal: 1 } ] },
    { q: "半年後、どうなっていたい？", a: [
      { t: "旅行で困らない", goal: -1 },
      { t: "仕事で英語を使える", goal: 1, work: 1 },
      { t: "目標の点数を取る", goal: 1, test: 1 } ] }
  ]
};
if (typeof module !== "undefined") module.exports = DATA;
