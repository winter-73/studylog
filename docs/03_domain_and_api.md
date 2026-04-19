# Domain & API Design (Draft)

## 1. ドメインモデル

### StudyEntry
- id: string (UUID)
- date: string (YYYY-MM-DD)
- durationMinutes: number
- category: string
- growthTags: string[]
- note: string
- createdAt: string (RFC3339)
- updatedAt: string (RFC3339)

### WeeklySummary
- weekStart: string (YYYY-MM-DD)
- totalMinutes: number
- entriesCount: number
- topGrowthTags: { tag: string, minutes: number }[]

## 2. API方針
- 初期は REST + JSON
- 認証は v0.1 では省略（ローカル単一ユーザー想定）
- URL は将来の versioning を見据えて /api/v1 を付与

## 3. エンドポイント（v0.1）

### POST /api/v1/entries
勉強記録を作成

Request:
{
  "date": "2026-04-19",
  "durationMinutes": 90,
  "category": "Go",
  "growthTags": ["Building"],
  "note": "HTTPハンドラとJSON処理を実装"
}

Response 201:
{
  "id": "...",
  "date": "2026-04-19",
  "durationMinutes": 90,
  "category": "Go",
  "growthTags": ["Building"],
  "note": "HTTPハンドラとJSON処理を実装",
  "createdAt": "...",
  "updatedAt": "..."
}

### GET /api/v1/entries?from=2026-04-01&to=2026-04-30
期間内の記録一覧

### GET /api/v1/summary/weekly?date=2026-04-19
指定日が属する週のサマリ

## 4. エラーレスポンス
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "durationMinutes must be greater than 0"
  }
}

## 5. バリデーション
- durationMinutes > 0
- date は妥当な日付
- growthTags は定義済みタグのみ
- note は 500 文字以内
