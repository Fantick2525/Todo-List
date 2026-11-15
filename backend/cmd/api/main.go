package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/Fantick2525/Todo-List/backend/internal/database"
	"github.com/Fantick2525/Todo-List/backend/internal/handlers"
	"github.com/Fantick2525/Todo-List/backend/internal/middleware"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(".env"); err != nil {
		log.Println("Файл .env не найден")
	}

	database.InitDB()

	jwtKey := []byte(os.Getenv("JWT_SECRET"))
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

	// Защищенные маршруты
	protectedMux := http.NewServeMux()
	protectedMux.HandleFunc("/profile", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "Это приватный профиль.")
	})

	// === МАРШРУТЫ ДЛЯ ЗАДАЧ ===
	protectedMux.HandleFunc("/tasks", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			taskHandler.GetTasks(w, r)
		} else if r.Method == http.MethodPost {
			taskHandler.CreateTask(w, r)
		} else {
			http.Error(w, "Метод не разрешен", http.StatusMethodNotAllowed)
		}
	})

	// Маршруты для конкретной задачи
	protectedMux.HandleFunc("/tasks/", func(w http.ResponseWriter, r *http.Request) {
		if strings.HasSuffix(r.URL.Path, "/restore") && r.Method == http.MethodPatch {
			taskHandler.RestoreTask(w, r)
		} else if r.Method == http.MethodPut {
			taskHandler.UpdateTask(w, r)
		} else if r.Method == http.MethodDelete {
			taskHandler.DeleteTask(w, r)
		} else {
			http.Error(w, "Метод не разрешен", http.StatusMethodNotAllowed)
		}
	})

	// Подключаем Middleware
	mux.Handle("/api/", http.StripPrefix("/api", middleware.AuthMiddleware(jwtKey)(protectedMux)))

	fmt.Printf("Сервер запущен на порту %s...\n", port)
	http.ListenAndServe(":"+port, mux)
}
