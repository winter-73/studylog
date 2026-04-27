package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
)

// ==========================================
// HTTPハンドラー（APIの受付窓口）
// ==========================================

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

func WeeklySummary(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSON(w, http.StatusMethodNotAllowed, errorResponse{
			Error: errorBody{
				Code:    "METHOD_NOT_ALLOWED",
				Message: "method not allowed",
			},
		})
		return
	}

	refDate := time.Now().UTC()
	dateParam := r.URL.Query().Get("date")
	if dateParam != "" {
		parsed, err := time.Parse("2006-01-02", dateParam)
		if err != nil {
			writeValidationError(w, "date must be in YYYY-MM-DD format")
			return
		}
		refDate = parsed
	}

	weekStart := startOfWeek(refDate)
	weekEnd := weekStart.AddDate(0, 0, 7)

	items := entryStore.list()
	totalMinutes := 0
	entriesCount := 0
	tagMinutes := map[string]int{}

	for _, item := range items {
		entryDate, err := time.Parse("2006-01-02", item.Date)
		if err != nil {
			continue
		}
		if entryDate.Before(weekStart) || !entryDate.Before(weekEnd) {
			continue
		}

		totalMinutes += item.DurationMinutes
		entriesCount++
		for _, tag := range item.GrowthTags {
			tagMinutes[tag] += item.DurationMinutes
		}
	}

	topGrowthTags := make([]summaryTagMinutes, 0, len(tagMinutes))
	for tag, minutes := range tagMinutes {
		topGrowthTags = append(topGrowthTags, summaryTagMinutes{Tag: tag, Minutes: minutes})
	}

	sort.Slice(topGrowthTags, func(i, j int) bool {
		if topGrowthTags[i].Minutes == topGrowthTags[j].Minutes {
			return topGrowthTags[i].Tag < topGrowthTags[j].Tag
		}
		return topGrowthTags[i].Minutes > topGrowthTags[j].Minutes
	})
	if len(topGrowthTags) > 3 {
		topGrowthTags = topGrowthTags[:3]
	}

	writeJSON(w, http.StatusOK, weeklySummaryResponse{
		WeekStart:     weekStart.Format("2006-01-02"),
		TotalMinutes:  totalMinutes,
		EntriesCount:  entriesCount,
		TopGrowthTags: topGrowthTags,
	})
}

func listEntries(w http.ResponseWriter, r *http.Request) {
	yearParam := r.URL.Query().Get("year")
	items := entryStore.list()

	if yearParam != "" {
		year, err := strconv.Atoi(yearParam)
		if err != nil || year < 1000 || year > 9999 {
			writeValidationError(w, "year must be a 4-digit number")
			return
		}
		items = entryStore.listByYear(year)
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"items": items,
	})
}

func createEntry(w http.ResponseWriter, r *http.Request) {
	// 悪意あるクライアントが巨大なボディを送りつけてメモリを枯渇させるのを防ぐ
	r.Body = http.MaxBytesReader(w, r.Body, 1<<20) // 1 MB

	var req createEntryRequest
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		writeValidationError(w, "invalid request body")
		return
	}

	if err := validateCreateEntryRequest(req); err != nil {
		writeValidationError(w, err.Error())
		return
	}

	now := time.Now().UTC().Format(time.RFC3339)
	res := createEntryResponse{
		// time.Now().UnixNano() は高負荷時に衝突する可能性があるため UUID を使用
		ID:              uuid.New().String(),
		Date:            req.Date,
		DurationMinutes: req.DurationMinutes,
		Category:        strings.TrimSpace(req.Category),
		GrowthTags:      req.GrowthTags,
		Note:            req.Note,
		CreatedAt:       now,
		UpdatedAt:       now,
	}

	entryStore.add(res)
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

type errorResponse struct {
	Error errorBody `json:"error"`
}

type errorBody struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

type weeklySummaryResponse struct {
	WeekStart     string              `json:"weekStart"`
	TotalMinutes  int                 `json:"totalMinutes"`
	EntriesCount  int                 `json:"entriesCount"`
	TopGrowthTags []summaryTagMinutes `json:"topGrowthTags"`
}

type summaryTagMinutes struct {
	Tag     string `json:"tag"`
	Minutes int    `json:"minutes"`
}

// ==========================================
// バリデーション
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
// ユーティリティ
// ==========================================

func writeValidationError(w http.ResponseWriter, message string) {
	writeJSON(w, http.StatusBadRequest, errorResponse{
		Error: errorBody{
			Code:    "VALIDATION_ERROR",
			Message: message,
		},
	})
}

func startOfWeek(t time.Time) time.Time {
	t = t.UTC()
	weekday := int(t.Weekday())
	if weekday == 0 {
		weekday = 7
	}
	daysFromMonday := weekday - 1
	start := t.AddDate(0, 0, -daysFromMonday)
	return time.Date(start.Year(), start.Month(), start.Day(), 0, 0, 0, 0, time.UTC)
}
