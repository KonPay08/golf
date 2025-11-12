# エンティティ抽出 手順書（MVP向け）

## 1) USから名詞/動詞をハイライト
- 名詞＝エンティティ候補（例: Round, Hole, HoleScore）
- 動詞＝ユースケース（例: 作成, 記録, 集計, 一覧）

## 2) グルーピング（責務/所有）を決める
- どれがどれを「所有」し同時整合が必要か？
- 例: 集約ルート = **Round** ／ 配下 = **Hole, HoleScore**

## 3) 多重度→コレクション化（命名）
- 1対多を**配列プロパティ名**に落とす
- 例: `Round.holes: Hole[]` ／ `Round.scores: HoleScore[]`

## 4) 境界を引く（MVP外を外す）
- 今は **Course/Group/Competition** を対象外（Futureへ）

## 5) 不変条件（破ると損害）を列挙
- `n ∈ {9,18}`
- `holes.length === n`
- `holes.number` は 1..n の一意（重複なし）
- `1 ≤ holeNumber ≤ n`
- `scores.holeNumber ⊆ holes.number`
- `par ∈ {3,4,5}`
- `1 ≤ strokes ≤ 12`
- ※ `toPar` は保存せず、毎回 `strokes - par` で算出

## 6) 代表シナリオで検証（手計算一致）
- 例: Par4で5打 → `toPar +1` ／ Par3で2打 → Birdie+1

## 7) 最小モデル化（YAGNI）
- 今のUSで使う属性だけ残す（追加は `?` で拡張）

## 8) UseCase I/F と DTO を定義（UI抜き）
- 例:
  - `CreateRound(date, n) -> { roundId }`
  - `RecordHoleScore(roundId, holeNumber, strokes) -> { roundId }`
  - `SummarizeRound(roundId) -> { gross, toPar, pars, birdies }`
  - `GetRound(roundId) -> Round`
  - `ListRounds() -> RoundSummary[]`

## 9) 独立性チェック（ピュアドメイン）
- UI/DB/時刻に依存しない**型＋純関数/軽量クラス**で実装
- 依存は UseCase/Repository I/F に逃がす

## 10) テスト準備
- ユニット: 不変条件・代表シナリオ
- 簡易E2E: 作成 → 記録 → 集計 → 一覧/詳細 の縦スライス

---

### 付録: MVPの最小モデル例
```ts
type Hole = { number: 1|2|...|18; par: 3|4|5 };
type Score = { holeNumber: number; strokes: number };
type Round = {
  id: string;
  date: string;         // YYYY-MM-DD
  n: 9|18;
  holes: Hole[];        // 当日のParスナップショット
  scores: Score[];
  courseName?: string;  // 任意
};
