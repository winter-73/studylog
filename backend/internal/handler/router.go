package handler

import "net/http"

// 経路案内の役割（ルーティング）を担うファイル

// NewRouter はアプリケーションのルーティングを定義して返す。
// ハンドラの登録だけを責任とし、ロジックはここに書かない。
func NewRouter() http.Handler { // Webサーバーがリクエストを処理するためのインターフェースを返す関数
	mux := http.NewServeMux()                  //「ルーター」のインスタンス作成。URLパターンとそれに対応する処理を登録するための入れ物
	mux.HandleFunc("/health", Health)          ///health パスへのリクエストを受け取ったとき、Health という名前の関数を実行するように登録
	mux.HandleFunc("/api/v1/entries", Entries) ///api/v1/entries パスへのリクエストを受け取ったとき、Entries という名前の関数を実行するように登録
	mux.HandleFunc("/api/v1/summary/weekly", WeeklySummary)

	// 最後に、完成したルーター(mux)を「門番(corsMiddleware)」で包んでから返します。
	// これにより、すべての通信がまず門番のチェックを受けるようになります。
	return corsMiddleware(mux)
}

// corsMiddleware は、フロントエンドからの通信をブロックせず許可する「門番」の役割を果たします。
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// 1. 許可証の発行：フロントエンドのURL（Viteのデフォルトである http://localhost:5173）からのアクセスを許可
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		// 2. 許可するHTTPメソッド（GET, POST, OPTIONS）を指定
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		// 3. 許可するデータの種類（JSONを送るために Content-Type ヘッダーを許可）
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		// 4. ブラウザの「事前確認（プリフライト）」への対応
		// ブラウザはPOSTなどのリクエストを送る前に、安全確認のため「OPTIONS」というメソッドで探りを入れてきます。
		// その場合は、許可証（上のヘッダー）だけを渡してすぐにOK（200）で返します。
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		// 5. 門番のチェックが終わったら、本来の処理（HealthやEntriesなど）にバトンタッチします。
		next.ServeHTTP(w, r)
	})
}
