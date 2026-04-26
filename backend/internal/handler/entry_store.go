package handler

import (
	"fmt"
	"strings"
	"sync"
)

// entryStore は、アプリケーション全体で共有される「仮のデータベース」の実体（インスタンス）です。
// APIの処理（entry.goなど）からは、この変数を通してデータの保存や取得を行います。
var entryStore = &inMemoryEntryStore{}

// inMemoryEntryStore は、学習記録をサーバーのメモリ上（RAM）に一時保存するための構造体です。
type inMemoryEntryStore struct {
	// mu: 複数の通信が同時にデータを読み書きして、データが壊れるのを防ぐための「鍵（排他制御）」です。
	// sync.RWMutex は「読み取り専用の鍵」と「書き込み専用の鍵」を使い分けられる効率的な仕組みです。
	mu sync.RWMutex

	// items: 実際の学習記録データ（createEntryResponse）を順番に保存していくリスト（箱）です。
	items []createEntryResponse
}

// add は、新しい学習記録をデータベースに安全に追加するためのメソッドです。
func (s *inMemoryEntryStore) add(item createEntryResponse) {
	// データの書き込み（追加）を行うため、他の処理が読み書きできないように「書き込み専用の鍵」をかけます。
	s.mu.Lock()

	// defer を使うことで、この関数が終わった瞬間に必ず「鍵を開ける（Unlock）」ように予約します。
	// 処理の途中で予期せぬエラーが起きても、鍵が閉まりっぱなしになるのを防ぎます。
	defer s.mu.Unlock()

	// 鍵がかかって安全が確保された状態で、リストの末尾に新しいデータを追加します。
	s.items = append(s.items, item)
}

// list は、保存されているすべての学習記録の一覧を安全に取得するためのメソッドです。
func (s *inMemoryEntryStore) list() []createEntryResponse {
	// データの読み取りを行うため、「読み取り専用の鍵」をかけます。
	// 他の「読み取り」は同時に許可しつつ、「書き込み（追加）」だけを待たせることで処理を止めません。
	s.mu.RLock()

	// 読み取りが終わったら、必ず鍵を開けるように予約します。
	defer s.mu.RUnlock()

	// 保存されているデータと同じサイズの、新しい空のリスト（out）を作成します。
	out := make([]createEntryResponse, len(s.items))

	// 実際のデータ（s.items）の中身を、新しく作ったリスト（out）にコピーします。
	// ※元の s.items をそのまま返すと、後から別の処理がデータを追加した際に
	// 予期せぬバグ（データ競合）を引き起こす危険があるため、安全な「コピー」を渡しています。
	copy(out, s.items)

	// コピーした安全なリストを呼び出し元に返します。
	return out
}

// listByYear は、指定した年（YYYY）に一致する学習記録だけを返します。
func (s *inMemoryEntryStore) listByYear(year int) []createEntryResponse {
	s.mu.RLock()
	defer s.mu.RUnlock()

	prefix := fmt.Sprintf("%04d-", year)
	out := make([]createEntryResponse, 0, len(s.items))
	for _, item := range s.items {
		if strings.HasPrefix(item.Date, prefix) {
			out = append(out, item)
		}
	}

	return out
}
