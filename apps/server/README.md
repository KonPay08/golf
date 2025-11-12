# 目的
nodeJS のモジュールをすぐに試せるやつ。

# 環境変数
`Git` に含めたくない値は `default.json` の値を空にして `config/development.json` で上書きする。

# コマンド

```
npm run test {{ファイル名}} # 任意のファイル名のテストをウォッチモードで実行
npm run test-all           # 全テスト実行
npm run start              # src/booter.ts をウォッチモードで実行
```
