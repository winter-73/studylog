package handler

import (
	"encoding/json"
	"net/http"
)

// Health は GET /health のハンドラ。
// サーバが起動しているかを確認するためのエンドポイント。
func Health(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{
		"status": "ok",
	})
}

// writeJSON はレスポンスのContent-Typeをセットして、vをJSONとして書き出す。
// 複数のハンドラで使う共通処理なのでこのファイルに定義しておく。
// 将来的にhandlerが増えたらhandler/util.goへ移動する。
func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}
