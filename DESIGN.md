# BullStation 設計ドキュメント

## ディレクトリ構成

```
src/
├── pages/
│   ├── Home.tsx                  # ホーム・設定画面
│   ├── StudyMode.tsx             # 学習モード
│   ├── TimeAttack.tsx            # タイムアタックモード
│   └── CountUp.tsx               # カウントアップモード
├── components/
│   ├── DartBoard/
│   │   ├── DartBoard.tsx         # ダーツボード描画・入力
│   │   └── dartBoardGeometry.ts  # SVG幾何学計算
│   ├── DartInput.tsx             # 選択済みダーツ表示・操作
│   └── OutRuleSelector.tsx       # アウトルール選択
├── utils/
│   ├── dartData.ts               # ダーツデータ定義
│   ├── checkoutCalculator.ts     # アウト計算・検証エンジン
│   ├── questionGenerator.ts      # 出題管理
│   └── localStorage.ts           # 永続化
└── types/index.ts                # 型定義
```

## 状態管理

グローバル状態は `App.tsx` で保持し、props / コールバック経由で各ページへ渡します。ローカルストレージへの同期もここで行います。

```
App.tsx
├── outRule: OutRule              # 選択中のアウトルール
└── showScores: boolean           # ボード表示モード
    ↓ props
    ├── Home.tsx
    ├── StudyMode.tsx
    ├── TimeAttack.tsx
    └── CountUp.tsx               # showScores のみ受け取る
```

ページ内の一時的な状態（選択ダーツ、問題、タイマーなど）は各ページの `useState` で管理します。

## 型定義

```typescript
type OutRule = 'open' | 'double' | 'master'

type DartSegmentType = 'single' | 'double' | 'triple' | 'bull' | 'bullseye'

interface Dart {
  type: DartSegmentType
  number?: number   // 1〜20（bull / bullseye は undefined）
  value: number     // 実際の得点
  label: string     // 表示用ラベル（例: "D20", "T18", "Bull"）
}

interface Checkout {
  darts: Dart[]
  total: number
}

interface HighScoreEntry {
  time: number      // 秒（小数第1位）
  correct: number   // 正答数 / 10
  outRule: OutRule
  date: string      // ISO 8601
}

type GamePhase = 'question' | 'result'
```

## 主要モジュール

### checkoutCalculator.ts — アウト計算エンジン

最も複雑なロジックを担うモジュールです。

**`generateCheckouts(score, outRule)`**

1投・2投・3投の全組み合わせを列挙し、有効なアウトを収集します。

```
1投: ALL_DARTS から finish 条件を満たすものを抽出
2投: ALL_DARTS × ALL_DARTS の積で合計 = score かつ finish 条件を満たすものを抽出
3投: 上記を3段に拡張
```

結果はクオリティスコア順にソートして上位10件を返します。

**クオリティスコアの計算**

```
score = (3 - 投数) * 1000 + 最初のダーツの value
```

投数が少ないほど高スコア、同投数なら最初のダーツの点数が高いほど上位に来ます。

**`isValidFinish(dart, outRule)`**

| outRule | 有効な最終ダーツ |
|---------|----------------|
| open | すべて |
| double | double, bullseye |
| master | double, triple, bullseye |

### questionGenerator.ts — 出題管理

`buildPool(outRule)` でそのルールで実際に上がれる点数のリストを構築し、キャッシュします。`nextQuestion()` は直近10問の履歴を除外してランダム出題します。

### dartBoardGeometry.ts — SVG幾何学

ダーツボードの各エリアは極座標で定義されており、`polarToXY()` と `arcPath()` を使ってSVGパスに変換します。

```
エリア半径（px、SVG座標系）:
  ブルズアイ : 13
  ブル       : 30
  シングル内 : 97
  トリプル   : 110〜124
  シングル外 : 183
  ダブル     : 183〜200
```

## ルーティング

```
/             → Home
/study        → StudyMode
/timeattack   → TimeAttack
/countup      → CountUp
```

BrowserRouter を使用した SPA 構成です。

## 永続化（LocalStorage）

| キー | 内容 |
|------|------|
| `am_out_rule` | 選択中のアウトルール |
| `am_question_history` | 直近10問の出題履歴 |
| `am_high_scores` | タイムアタックのハイスコア（最大10件、タイム昇順） |
| `am_show_scores` | ボード表示モード |

カウントアップのスコアは現状セッション内のみ保持（LocalStorage 非永続）。

## ゲームフロー

### 学習モード

```
出題 (question)
  → ダーツ選択（最大3本）
  → 「決定」ボタン
  → 正誤判定 + 模範解答表示 (result)
  → 「次の問題」ボタン
  → 出題 (question) ...
```

### タイムアタックモード

```
準備画面（ハイスコア表示）
  → 「スタート」ボタン
  → タイマー開始 + 出題 × 10問（上記フローを繰り返し）
  → 終了画面（タイム・正答数・回答履歴・ハイスコア保存）
```

### カウントアップ

```
ゲーム画面（R1〜R8）
  → ダーツボードで1投ずつ選択（最大3本）
  → RoundChange ボタン or Enter キーで確定
  → 左パネルにラウンドスコア・各投点数を記録
  → 予想スコア・平均・レーティングをリアルタイム更新
  → R8 完了後 → 結果画面（合計・フライト・平均・ラウンド履歴）
```

## カウントアップ レーティング設計

ダーツライブの01スタッツ（3投平均）を8倍することで、カウントアップ8ラウンドのスコアに換算しています。

| レーティング | フライト | 最低スコア |
|:-----------:|:-------:|----------:|
| 1 | C | 0 |
| 2 | C | 320 |
| 3 | C | 360 |
| 4 | CC | 400 |
| 5 | CC | 440 |
| 6 | B | 480 |
| 7 | B | 520 |
| 8 | BB | 560 |
| 9 | BB | 600 |
| 10 | A | 640 |
| 11 | A | 680 |
| 12 | A | 720 |
| 13 | AA | 760 |
| 14 | AA | 816 |
| 15 | AA | 872 |
| 16 | SA | 928 |
| 17 | SA | 984 |
| 18 | SA | 1040 |

レーティングは**予想最終スコア**（現在平均 × 8）に対して算出します。右パネルの縦型バーはフライト名（左）とレベル番号（右）を表示し、達成済みレベルを色で塗りつぶします。

**カウントアップ固有ルール**
- アウターブル（通常25点）をカウントアップでは50点として扱う
