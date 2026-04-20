package handler

import "net/http"

// NewRouter はアプリケーションのルーティングを定義して返す。
// ハンドラの登録だけを責任とし、ロジックはここに書かない。
func NewRouter() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/health", Health)
	mux.HandleFunc("/api/v1/entries", Entries)
	return mux
}
