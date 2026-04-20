package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"
)

// ==========================================
// HTTPハンドラー（APIの受付窓口）
// ==========================================

// Entries は、/api/v1/entries へのリクエストをHTTPメソッド（GET/POST）ごとに振り分けるルーター関数です。
func Entries(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		// GETリクエストの場合は、データ一覧の「取得」処理を呼び出します。
		listEntries(w, r)
	case http.MethodPost:
		// POSTリクエストの場合は、データの「新規作成」処理を呼び出します。
		createEntry(w, r)
	default:
		// GETでもPOSTでもないメソッド（PUTやDELETEなど）は許可していないため、405エラーを返します。
		writeJSON(w, http.StatusMethodNotAllowed, errorResponse{
			Error: errorBody{
				Code:    "METHOD_NOT_ALLOWED",
				Message: "method not allowed",
			},
		})
	}
}

// listEntries は、保存されている学習記録の一覧を取得してJSONで返す処理です。
func listEntries(w http.ResponseWriter, _ *http.Request) {
	// インメモリデータベースから、保存されているすべてのデータを取得します。
	items := entryStore.list()

	// 取得したデータを "items" というキーの配列に入れてクライアントに返します。（HTTPステータス: 200 OK）
	writeJSON(w, http.StatusOK, map[string]any{
		"items": items,
	})
}

// createEntry は、クライアントから送られたデータをもとに新しい学習記録を作成する処理です。
func createEntry(w http.ResponseWriter, r *http.Request) {
	var req createEntryRequest

	// 1. リクエストデータ（JSON）の読み取り
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields() // 定義されていない未知の項目がJSONに含まれていた場合はエラーにします。
	if err := dec.Decode(&req); err != nil {
		// JSONの形式が間違っている場合は400エラーを返します。
		writeValidationError(w, fmt.Sprintf("invalid request body: %v", err))
		return
	}

	// 2. データの入力チェック（バリデーション）
	if err := validateCreateEntryRequest(req); err != nil {
		// ルール違反がある場合は、エラーメッセージとともに400エラーを返します。
		writeValidationError(w, err.Error())
		return
	}

	// 3. 保存するための新しいデータを作成
	now := time.Now().UTC().Format(time.RFC3339) // 現在時刻を標準的なフォーマット（RFC3339）で取得します。
	res := createEntryResponse{
		ID:              fmt.Sprintf("entry_%d", time.Now().UnixNano()), // 現在時刻のナノ秒を使って、被らないIDを自動生成します。
		Date:            req.Date,
		DurationMinutes: req.DurationMinutes,
		Category:        strings.TrimSpace(req.Category), // カテゴリの前後に無駄な空白があれば取り除きます。
		GrowthTags:      req.GrowthTags,
		Note:            req.Note,
		CreatedAt:       now, // 作成日時
		UpdatedAt:       now, // 更新日時（作成時なので同じ時刻）
	}

	// 4. 作成したデータをインメモリデータベースに保存
	entryStore.add(res)

	// 5. 保存に成功したデータと、HTTPステータス: 201 Created（作成完了）をクライアントに返します。
	writeJSON(w, http.StatusCreated, res)
}

// ==========================================
// データ構造体（型定義）
// ==========================================

// createEntryRequest は、クライアントから送られてくるJSONデータの期待する形です。
type createEntryRequest struct {
	Date            string   `json:"date"`            // 学習日 (例: "2023-10-24")
	DurationMinutes int      `json:"durationMinutes"` // 学習時間（分）
	Category        string   `json:"category"`        // カテゴリ名
	GrowthTags      []string `json:"growthTags"`      // 成長タグのリスト
	Note            string   `json:"note"`            // 自由記述のメモ
}

// createEntryResponse は、APIが保存した後にクライアントに返す学習記録データの形です。
type createEntryResponse struct {
	ID              string   `json:"id"`              // サーバー側で自動採番した一意のID
	Date            string   `json:"date"`            // 学習日
	DurationMinutes int      `json:"durationMinutes"` // 学習時間（分）
	Category        string   `json:"category"`        // カテゴリ名
	GrowthTags      []string `json:"growthTags"`      // 成長タグのリスト
	Note            string   `json:"note"`            // メモ
	CreatedAt       string   `json:"createdAt"`       // データ作成日時
	UpdatedAt       string   `json:"updatedAt"`       // データ最終更新日時
}

// errorResponse は、APIがエラーを返すときの統一されたデータの形です。
type errorResponse struct {
	Error errorBody `json:"error"` // エラーの詳細をまとめた箱
}

// errorBody は、エラーの具体的な内容です。
type errorBody struct {
	Code    string `json:"code"`    // エラーの種類を表すコード（例: "VALIDATION_ERROR"）
	Message string `json:"message"` // ユーザーや開発者が読むための詳細なエラーメッセージ
}

// ==========================================
// バリデーション（入力チェック）関数
// ==========================================

// validateCreateEntryRequest は、送られてきたデータが正しいルールに従っているか細かく検証します。
func validateCreateEntryRequest(req createEntryRequest) error {
	// ルール1: 日付が "YYYY-MM-DD" の形式になっているか？
	if _, err := time.Parse("2006-01-02", req.Date); err != nil {
		return fmt.Errorf("date must be in YYYY-MM-DD format")
	}

	// ルール2: 学習時間が0分より大きい（1分以上）か？
	if req.DurationMinutes <= 0 {
		return fmt.Errorf("durationMinutes must be greater than 0")
	}

	// ルール3: カテゴリが未入力（または空白だけ）になっていないか？
	if strings.TrimSpace(req.Category) == "" {
		return fmt.Errorf("category is required")
	}

	// ルール4: メモが500文字以内に収まっているか？
	if len(req.Note) > 500 {
		return fmt.Errorf("note must be 500 characters or less")
	}

	// ルール5: 指定されたタグが、あらかじめ許可された3種類のいずれかであるか？
	allowed := map[string]struct{}{
		"Understanding": {}, // 理解
		"Building":      {}, // 構築
		"Output":        {}, // 発信・出力
	}
	for _, tag := range req.GrowthTags {
		if _, ok := allowed[tag]; !ok {
			// 許可されていないタグが混ざっていたらエラーにします。
			return fmt.Errorf("growthTags contains unsupported tag: %s", tag)
		}
	}

	// 全てのチェックをクリアしたら、エラーなし（nil）を返します。
	return nil
}

// ==========================================
// ユーティリティ（便利関数）
// ==========================================

// writeValidationError は、バリデーションエラーが発生した際に、
// 統一されたフォーマットで400エラー（Bad Request）を返すための補助関数です。
func writeValidationError(w http.ResponseWriter, message string) {
	writeJSON(w, http.StatusBadRequest, errorResponse{
		Error: errorBody{
			Code:    "VALIDATION_ERROR",
			Message: message,
		},
	})
}
