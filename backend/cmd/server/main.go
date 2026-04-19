package main

import (
	"log"
	"net/http"
	"os"

	// apphttp "studylog/backend/internal/http"
	"studylog/backend/internal/handler" // ← エイリアス不要になった
)

func main() {
	addr := os.Getenv("PORT")
	if addr == "" {
		addr = "8080"
	}

	router := handler.NewRouter()
	log.Printf("server started on :%s", addr)
	if err := http.ListenAndServe(":"+addr, router); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}
