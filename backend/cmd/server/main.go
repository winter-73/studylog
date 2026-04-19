package main

import (
	"log"
	"net/http"
	"os"

	apphttp "studylog/backend/internal/http"
)

func main() {
	addr := os.Getenv("PORT")
	if addr == "" {
		addr = "8080"
	}

	router := apphttp.NewRouter()
	log.Printf("server started on :%s", addr)
	if err := http.ListenAndServe(":"+addr, router); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}
