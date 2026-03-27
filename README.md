# IdeathonWeb 💡

アイデアソンの企画・運営・アイデア実現をサポートするウェブプラットフォームです。

## 機能

- **ホームページ** (`index.html`) — サイト紹介、最近のアイデアソン一覧、統計表示
- **アイデアソン作成** (`propose.html`) — タイトル・日時・参加者・カテゴリーなどを設定して新規イベントを作成
- **テーマを具体化** (`realization.html`) — アイデアの追加・編集・進捗管理・投票機能

## 使い方

### ローカルで開く

```bash
# そのままブラウザで開く（ファイルダブルクリック等）
open index.html

# または簡易サーバーを起動
npx serve .
# → http://localhost:3000 でアクセス
```

### ページ構成

```
ideathonweb/
├── index.html          # ホームページ
├── propose.html        # アイデアソン作成ページ
├── realization.html    # テーマ具体化・アイデア管理ページ
├── css/
│   ├── style.css       # 共通スタイル
│   ├── home.css        # ホームページ専用スタイル
│   ├── propose.css     # 作成ページ専用スタイル
│   └── realization.css # 実現化ページ専用スタイル
├── js/
│   ├── storage.js      # localStorage データ永続化
│   ├── utils.js        # ユーティリティ関数
│   └── app.js          # メインアプリケーションロジック
├── package.json
└── .gitignore
```

## 技術スタック

- HTML5 / CSS3 / JavaScript（バニラ）
- localStorage によるデータ永続化
- レスポンシブデザイン（モバイル対応）

## データについて

初回アクセス時にサンプルデータが自動的に作成されます。  
すべてのデータはブラウザの localStorage に保存されます。
