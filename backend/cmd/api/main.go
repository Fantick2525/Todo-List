package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/Fantick2525/Todo-List/backend/internal/database"
	"github.com/Fantick2525/Todo-List/backend/internal/handlers"
	"github.com/Fantick2525/Todo-List/backend/internal/middleware"
	"github.com/joho/godotenv"
)

// Middleware для поддержки CORS при локальной разработке
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func main() {
	if err := godotenv.Load(".env"); err != nil {
		log.Println("Файл .env не найден, используются переменные окружения по умолчанию")
	}

	database.InitDB()

	jwtKey := []byte(os.Getenv("JWT_SECRET"))
	if len(jwtKey) == 0 {
		jwtKey = []byte("super_secret_jwt_key_taskboard_2026")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	authHandler := &handlers.AuthHandler{JwtKey: jwtKey}
	taskHandler := &handlers.TaskHandler{}

	mux := http.NewServeMux()

	// Публичные маршруты
	mux.HandleFunc("/register", authHandler.Register)
	mux.HandleFunc("/login", authHandler.Login)

	// Приватные защищенные маршруты
	protectedMux := http.NewServeMux()
	protectedMux.HandleFunc("/profile", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintln(w, `{"message": "Вы авторизованы!"}`)
	})

	// /api/tasks (GET - список, POST - создание)
	protectedMux.HandleFunc("/tasks", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			taskHandler.GetTasks(w, r)
		case http.MethodPost:
			taskHandler.CreateTask(w, r)
		default:
			http.Error(w, "Метод не разрешен", http.StatusMethodNotAllowed)
		}
	})

	// /api/tasks/{id} (DELETE - удаление, PUT/PATCH - обновление)
	protectedMux.HandleFunc("/tasks/", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodDelete:
			taskHandler.DeleteTask(w, r)
		case http.MethodPut, http.MethodPatch:
			taskHandler.UpdateTask(w, r)
		default:
			http.Error(w, "Метод не разрешен", http.StatusMethodNotAllowed)
		}
	})

	mux.Handle("/api/", http.StripPrefix("/api", middleware.AuthMiddleware(jwtKey)(protectedMux)))

	fmt.Printf("Сервер запущен на порту %s...\n", port)
	handlerWithCORS := corsMiddleware(mux)
	if err := http.ListenAndServe(":"+port, handlerWithCORS); err != nil {
		log.Fatal("Ошибка запуска сервера:", err)
	}
}
