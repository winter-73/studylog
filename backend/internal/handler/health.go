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

//w http.ResponseWriter, r *http.Request: GoでWebを扱う時の超重要キーワードです。

//w は「返信を書くための便箋（レスポンス）」

//r は「相手から送られてきた手紙の中身（リクエスト）」です。

//writeJSON: entry.go でも何度も使われる重要な関数です。毎回「ヘッダーを設定して…」と書くのは面倒なので、ここで一つの関数にまとめています。

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}
