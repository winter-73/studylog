package handler

import (
	"net/http"
)

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

func listEntries(w http.ResponseWriter, _ *http.Request) {
	// TODO: Repositoryからデータを取得する（次ステップで実装）
	writeJSON(w, http.StatusOK, map[string]any{
		"items": []any{},
	})
}

func createEntry(w http.ResponseWriter, _ *http.Request) {
	// TODO: リクエストボディをパース・バリデートしてRepositoryに保存する（次ステップで実装）
	writeJSON(w, http.StatusCreated, map[string]string{
		"message": "entry endpoint placeholder",
	})
}

// errorResponse はAPIエラーレスポンスの統一構造。
// docs/03_domain_and_api.md で定義したフォーマットに対応する。
type errorResponse struct {
	Error errorBody `json:"error"`
}

type errorBody struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}
