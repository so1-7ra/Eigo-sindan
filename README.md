# 英語やり直し診断

10問の診断で、AI英会話アプリとオンライン英会話のどちらが合うか、どのサービスから試すとよいかが分かるサイトです。アフィリエイト（成果報酬型の広告）で運営します。

## いちばん大事にしていること：個人情報保護と機密性

### 訪れた人の情報を集めない

- 診断の答えと料金計算機の入力は、ブラウザの中だけで計算します。送信も保存もしません（URLにも答えは出しません）。
- Cookie、localStorage などは使いません。アクセス解析、広告配信ツール、外部フォント・画像も読み込みません。ページを開いただけで外部と通信することはありません。
- すべてのページに `Content-Security-Policy` を入れ、このサイト自身のファイル以外は読み込めず、通信もできないようにしています（`connect-src 'none'`、`form-action 'none'`）。
- 参照元は送らない設定です（`referrer: no-referrer`）。広告リンクだけは、成果の計測のためにドメインだけを送ります（`referrerpolicy="strict-origin"`）。
- ASPの広告タグに付いてくる「表示回数を数える画像（インプレッション計測）」は貼りません。ページを見ただけでASPに通信が行くのを防ぐためです。クリック数と成果は普通に計測されます。

### 運営者の情報を出さない

- 運営者はハンドルネームで載せます。本名・住所・電話番号・個人のメールアドレスはサイトにもリポジトリにも書きません。
- 問い合わせ先は、専用のメールアドレスなどを別に用意して `src/config.js` の `contact` に入れます。
- git のコミットに使うメールアドレスは、GitHub の noreply アドレス（`ID+ユーザー名@users.noreply.github.com`）にします。GitHub の Settings → Emails で「Keep my email addresses private」と「Block command line pushes that expose my email」をオンにしてください。
- ASPのログイン情報、成果レポート、振込先などはリポジトリに入れません（`.gitignore` で `notes/` `private/` `reports/` `*.csv` `.env` を除外しています）。
- `node tools/check.js` が、秘密鍵・トークン・パスワード・電話番号・メールアドレスらしき文字列が入っていないかを調べます。

### 広告のルール

- 全ページの一番上に「このサイトには広告（PR）を含みます」と出します（ステマ規制への対応）。
- 広告リンクには `rel="sponsored"` と「PR」の印を付けます。
- 診断の結果や比較表の順番は、報酬の額では決めません。
- 試していないサービスは「公式サイトの情報をもとにまとめた」と明記します。

## ファイルの構成

| ファイル | 中身 |
| --- | --- |
| `src/config.js` | サイト名・URL・運営者名・問い合わせ先 |
| `src/data.js` | サービス（料金・無料体験・広告リンク）、診断の質問、結果タイプ |
| `src/articles/*.html` | 読みもの。先頭のコメントに題名などを書く。`{{card:speak}}` でサービスのカードを入れられる |
| `static/assets/` | 見た目（`style.css`）と、診断・計算機・比較表のJS |
| `tools/build.js` | `src/` と `static/` から公開用の `docs/` を作る |
| `tools/check.js` | プライバシー・安全の静的チェック |
| `tools/smoke-test.js` | ブラウザで全ページと診断を動かすチェック |
| `docs/` | 公開されるファイル（自動生成。直接は編集しない） |

サーバー側の処理やデータベースはありません。必要なのは Node.js だけです。

## 更新のしかた

1. `src/` の中を直す。
2. `node tools/build.js` で `docs/` を作り直す。
3. `node tools/check.js` を実行して「問題は見つかりませんでした」と出るのを確かめる。
4. `python3 -m http.server 8000 --directory docs` を別の画面で動かし、`node tools/smoke-test.js` を実行する。

## 公開するまでにやること

- [ ] `src/data.js` の料金・無料体験を各社の公式サイトで確かめ、`checked` に確認した年月を入れる（いまは比較記事による目安）
- [ ] `official` のURLが正しいか確かめる
- [ ] ASPの審査が通ったら `aff` に広告リンクのURLだけを入れる（タグ全体や計測用の画像は貼らない）
- [ ] 独自ドメインを取り、`src/config.js` の `siteUrl` に入れて作り直す（canonical と sitemap.xml が出るようになる）
- [ ] 問い合わせ先を用意して `contact` に入れる
- [ ] GitHub で新しいリポジトリを作り、Settings → Pages で「main ブランチの /docs」を公開元にする
- [ ] 独自ドメインを使う場合は、GitHub Pages の「Enforce HTTPS」をオンにする
- [ ] Google Search Console に登録する
