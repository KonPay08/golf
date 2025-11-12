# MVPエンティティ

1) USから名詞/動詞をハイライト
- Round
- Hole
- HoleScore

## 2) グルーピング（責務/所有）を決める
- Round
  - Hole
    - HoleScore

## 3) 多重度→コレクション化（命名）
- Round 1 : many Hole
  - Round.holes: Hole[]
- Round 1 : many HoleScore
  - Round.HoleScore: HoleScore[]

## 4) 境界を引く（MVP外を外す）

## 5) 不変条件（破ると損害）を列挙
- holes.length === n
- n ∈ {9,18}
- holes.number は 1..n の一意（重複なし）
- 1 ≤ holeNumber ≤ n
- scores.holeNumber ⊆ holes.number
- par ∈ {3, 4, 5}
- 1 ≤ stroke

## 6) 代表シナリオで検証（手計算一致）

## 7) 最小モデル化（YAGNI）
- 今のUSで使う属性だけ残す（追加は `?` で拡張）

## 8) UseCase I/F と DTO を定義（UI抜き）

- CreateRoundUseCase(date, n) -> { roundId }
- EntryScoreUseCase(roundId, holeNumber, stroke) -> { roundId }
- SummarizeRoundUseCase(roundId) -> { gross, toPar, pars, birdies, eagles }
- GetRoundUseCase(roundId) -> { roundId, date, n, courseName, holes, scores, summary }
- ListRoundsUseCase() -> { rounds }