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

// Entries は /api/v1/entries へのリクエストをメソッドで振り分ける。
func Entries(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		listEntries(w, r)
	case http.MethodPost:
		createEntry(w, r)
	default:
		writeJSON(w, http.StatusMethodNotAllowed, errorResponse{
			Error: errorBody{
				Code:    "METHOD_NOT_ALLOWED",
				Message: "method not allowed",
			},
		})
	}
}

// listEntries は、保存されている学習記録の一覧を取得してJSONで返す処理
func listEntries(w http.ResponseWriter, _ *http.Request) {
	items := entryStore.list() // entry_store.go の関数を呼び出し
	writeJSON(w, http.StatusOK, map[string]any{
		"items": items,
	})
}

// createEntry は、クライアントから送られたデータをもとに新しい学習記録を作成する処理
func createEntry(w http.ResponseWriter, r *http.Request) {
	var req createEntryRequest
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		writeValidationError(w, fmt.Sprintf("invalid request body: %v", err))
		return
	}

	if err := validateCreateEntryRequest(req); err != nil {
		writeValidationError(w, err.Error())
		return
	}

	now := time.Now().UTC().Format(time.RFC3339)
	res := createEntryResponse{
		ID:              fmt.Sprintf("entry_%d", time.Now().UnixNano()),
		Date:            req.Date,
		DurationMinutes: req.DurationMinutes,
		Category:        strings.TrimSpace(req.Category),
		GrowthTags:      req.GrowthTags,
		Note:            req.Note,
		CreatedAt:       now,
		UpdatedAt:       now,
	}

	entryStore.add(res) // entry_store.go の関数を呼び出して保存

	writeJSON(w, http.StatusCreated, res)
}

// ==========================================
// データ構造体（型定義）
// ==========================================

type createEntryRequest struct {
	Date            string   `json:"date"`
	DurationMinutes int      `json:"durationMinutes"`
	Category        string   `json:"category"`
	GrowthTags      []string `json:"growthTags"`
	Note            string   `json:"note"`
}

type createEntryResponse struct {
	ID              string   `json:"id"`
	Date            string   `json:"date"`
	DurationMinutes int      `json:"durationMinutes"`
	Category        string   `json:"category"`
	GrowthTags      []string `json:"growthTags"`
	Note            string   `json:"note"`
	CreatedAt       string   `json:"createdAt"`
	UpdatedAt       string   `json:"updatedAt"`
}

// errorResponse はAPIエラーレスポンスの統一構造。
type errorResponse struct {
	Error errorBody `json:"error"`
}

type errorBody struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

// ==========================================
// バリデーション（入力チェック）関数
// ==========================================

func validateCreateEntryRequest(req createEntryRequest) error {
	if _, err := time.Parse("2006-01-02", req.Date); err != nil {
		return fmt.Errorf("date must be in YYYY-MM-DD format")
	}

	if req.DurationMinutes <= 0 {
		return fmt.Errorf("durationMinutes must be greater than 0")
	}

	if strings.TrimSpace(req.Category) == "" {
		return fmt.Errorf("category is required")
	}

	if len(req.Note) > 500 {
		return fmt.Errorf("note must be 500 characters or less")
	}

	allowed := map[string]struct{}{
		"Understanding": {},
		"Building":      {},
		"Output":        {},
	}
	for _, tag := range req.GrowthTags {
		if _, ok := allowed[tag]; !ok {
			return fmt.Errorf("growthTags contains unsupported tag: %s", tag)
		}
	}

	return nil
}

// ==========================================
// ユーティリティ（便利関数）
// ==========================================

func writeValidationError(w http.ResponseWriter, message string) {
	writeJSON(w, http.StatusBadRequest, errorResponse{
		Error: errorBody{
			Code:    "VALIDATION_ERROR",
			Message: message,
		},
	})
}
