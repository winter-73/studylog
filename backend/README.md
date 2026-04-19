# Backend (Go)

## 起動

```bash
cd backend
PORT=8080 /usr/local/go/bin/go run ./cmd/server
```

## エンドポイント（現時点）
- GET /health
- GET /api/v1/entries
- POST /api/v1/entries

## メモ
- 現在はプレースホルダ実装
- 次フェーズでバリデーションとメモリ内保存を追加
