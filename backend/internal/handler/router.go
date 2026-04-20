package handler

import "net/http"

// NewRouter はアプリケーションのルーティングを定義して返す。
// ハンドラの登録だけを責任とし、ロジックはここに書かない。
func NewRouter() http.Handler { // Webサーバーがリクエストを処理するためのインターフェースを返す関数
	mux := http.NewServeMux()                  //「ルーター」のインスタンス作成。URLパターンとそれに対応する処理を登録するための入れ物
	mux.HandleFunc("/health", Health)          ///health パスへのリクエストを受け取ったとき、Health という名前の関数を実行するように登録
	mux.HandleFunc("/api/v1/entries", Entries) ///api/v1/entries パスへのリクエストを受け取ったとき、Entries という名前の関数を実行するように登録
	return mux                                 // 設定が終わったルーター（mux）を呼び出し元に返します。
}
