# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn dev            # 開発サーバー起動 (http://localhost:5173)
yarn build          # 型チェック + Vite ビルド (tsc && vite build)
yarn preview        # ビルド成果物をローカルプレビュー
yarn lint           # ESLint（src/ 全体）
yarn lint:fix       # ESLint 自動修正
yarn format         # Prettier フォーマット適用
yarn format:check   # Prettier フォーマット確認
```

## アーキテクチャ概要

React 18 + TypeScript + Vite + Tailwind CSS の SPA。React Router DOM 6 で `/`, `/study`, `/timeattack`, `/countup`, `/zeroone` の5ルートを管理。

### コンポーネント構造（Atomic Design）

```
src/components/
  atoms/        Button, Toggle
  molecules/    PageHeader, DartSlot, DartSlotRow, DartActionButtons, DartInput, OutRuleSelector
  organisms/    DartBoard/DartBoard.tsx, DartBoard/dartBoardGeometry.ts, DartControls.tsx
```

- **atoms**: 単一のUI要素。`Button`（primary/secondary/ghost）、`Toggle`（スイッチ）
- **molecules**: atoms を組み合わせた機能単位。`DartInput`（スロット+undo/clear+確定）、`PageHeader`（戻るボタン+タイトル+右スロット）
- **organisms**: 複数のmoleculesを束ねた画面ブロック。`DartControls` = DartBoard + DartSlotRow + DartActionButtons
- **templates**: `pages/*/template.tsx` — hooks から受け取ったデータを純粋に描画。ロジック・フック呼び出しなし
- **pages**: `pages/*/index.tsx` — hooks を呼んで state を取得し、template に props として渡す

### 状態管理

グローバル設定（`outRule`, `showScores`）は `src/contexts/SettingsContext.tsx` の `SettingsProvider` で管理。`useSettings()` フックで各ページから参照する。セッターは localStorage 保存を内包するため、ページ側で `saveOutRule` / `saveShowScores` を呼ぶ必要はない。

ページ固有のゲーム状態はそのページと同じディレクトリに `hooks.ts` として配置する。

| パス | 担当 |
|---|---|
| `src/pages/countUp/hooks.ts` | カウントアップ全状態・Enter キー処理・レーティング計算 |
| `src/pages/zeroOne/hooks.ts` | 01ゲーム本編の状態・ターン管理・バースト判定 |
| `src/pages/studyMode/hooks.ts` | 学習モードのゲーム状態・正解判定・問題生成 |
| `src/pages/timeAttack/hooks.ts` | タイムアタックの状態・タイマー・ハイスコア保存 |

`pages/countUp/hooks.ts` は `TOTAL_ROUNDS` / `RATING_LEVELS` / `getRatingLevel` / `RoundData` を export。`pages/zeroOne/hooks.ts` は `PlayerCount` / `StartScore` / `BullMode` / `RoundScoreCell` 型も export する。

**例外**: `zeroOne/index.tsx` はセットアップ state（playerCount, startScore, outRule, bullMode）をローカルで保持し、`ZeroOneGame` サブコンポーネントが `useZeroOneGame` を呼び出す（フックを条件付きで呼べない制約への対処）。

### コアロジック

**`src/utils/checkoutCalculator.ts`** がアプリの中核。`generateCheckouts(score, outRule)` は全ダーツ（62本）の1〜3投組み合わせをブルートフォースで列挙し、クオリティスコア順上位10件を返す。初回呼び出しが重いためキャッシュ済み結果を使い回すこと。

**クオリティスコア**: `(3 - 投数) × 100000 + 最初のダーツのdartQuality()` — 投数優先、同投数なら先頭ダーツの点数で優劣判定。

### OutRule と仕上げ判定

```
open   → すべてのダーツで上がり可
double → double または bullseye のみ
master → double / triple / bullseye のみ
```

`isValidFinish(dart, outRule)` が判定の単一の真実。

### カウントアップ固有ルール

アウターブル（通常 25pt）をカウントアップでは **50pt** として扱う。`handleDartSelect` 内で `dart.type === 'bull'` の場合に value を 50 に変換（DartBoard 側では変換しない）。レーティングは「現在平均 × 8」の予想スコアに対して算出（C〜SA の18段階）。

### 01ゲーム（ZeroOne）固有ルール

- `zeroOne/template.tsx` は `ZeroOneSetupTemplate` と `ZeroOneGameTemplate` を export
- ブルモード `'separate'`（bull=25, bullseye=50）vs `'fat'`（どちらも50pt）を切り替え可能
- バーストはスコアが 0 未満、またはルール違反の上がり。リマッチ時はプレイヤー順を逆転

### LocalStorage キー

| キー | 内容 |
|------|------|
| `am_out_rule` | OutRule |
| `am_question_history` | 直近10問の出題履歴 |
| `am_high_scores` | タイムアタックハイスコア（最大10件、タイム昇順） |
| `am_show_scores` | ボード上スコア表示フラグ |

### SVGダーツボード

`organisms/DartBoard/DartBoard.tsx` は SVG で描画。座標計算は `dartBoardGeometry.ts` の `polarToXY()` / `arcPath()` を使用。中心 (200, 200)、最大半径 200px。ダーツ選択は `onDartSelect` コールバックで上位コンポーネントへ通知。

## コーディングルール

### ESLint（`eslint.config.js`）

- `typescript-eslint` recommended + `react-hooks` recommended を適用
- `react/prop-types: off`（TypeScript が代替するため）
- `@typescript-eslint/no-unused-vars: error`（アンダースコアプレフィックス `_` で抑制可）
- **新しいファイルを作成・編集したら `yarn lint` を通すこと**

### Prettier（`.prettierrc`）

```json
{ "semi": true, "singleQuote": true, "tabWidth": 2, "trailingComma": "es5", "printWidth": 100 }
```

- **ファイル編集後は `yarn format` を実行してフォーマットを揃えること**

### TypeScript

- `strict: true` / `noUnusedLocals` / `noUnusedParameters` — 未使用変数・引数はビルドエラー
- 共有型はすべて `src/types/index.ts` に集約する

### 自動フック（`.claude/settings.json`）

`.ts` / `.tsx` ファイルを Edit または Write した直後に `yarn lint` と `yarn format:check` が自動実行される。警告・エラーが出た場合は次の編集前に解消すること。

## 型定義の置き場

すべての共有型は `src/types/index.ts` に集約。`OutRule` / `Dart` / `Checkout` / `HighScoreEntry` / `GamePhase` が主要型。
