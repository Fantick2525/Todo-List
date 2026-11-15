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

func main() {
	if err := godotenv.Load("../../.env"); err != nil {
		log.Println("Файл .env не найден")
	}

	database.InitDB()

	jwtKey := []byte(os.Getenv("JWT_SECRET"))
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	authHandler := &handlers.AuthHandler{JwtKey: jwtKey}

	mux := http.NewServeMux()

	// Публичные маршруты
	mux.HandleFunc("/register", authHandler.Register)
	mux.HandleFunc("/login", authHandler.Login)
	// mux.HandleFunc("/forgot-password", authHandler.ForgotPassword)
	// mux.HandleFunc("/reset-password", authHandler.ResetPassword)

	// Приватный тестовый маршрут
	protectedMux := http.NewServeMux()
	protectedMux.HandleFunc("/profile", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "Вы авторизованы!")
	})

	mux.Handle("/api/", http.StripPrefix("/api", middleware.AuthMiddleware(jwtKey)(protectedMux)))

	fmt.Printf("Сервер запущен на порту %s...\n", port)
	http.ListenAndServe(":"+port, mux)
}
