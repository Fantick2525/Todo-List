package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/Fantick2525/Todo-List/backend/internal/database"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	JwtKey []byte
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Login    string `json:"login"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Неверный формат данных", http.StatusBadRequest)
		return
	}

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	query := `INSERT INTO users (login, email, password) VALUES ($1, $2, $3) RETURNING id`
	var newUserID int

	err := database.DB.QueryRow(query, req.Login, req.Email, string(hashedPassword)).Scan(&newUserID)
	if err != nil {
		http.Error(w, "Ошибка регистрации (логин или email заняты)", http.StatusConflict)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Успешная регистрация"})
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Login    string `json:"login"`
		Password string `json:"password"`
	}
	json.NewDecoder(r.Body).Decode(&req)

	query := `SELECT id, password FROM users WHERE login = $1`
	var userID int
	var hashedPassword string

	err := database.DB.QueryRow(query, req.Login).Scan(&userID, &hashedPassword)
	if err != nil {
		http.Error(w, "Неверный логин или пароль", http.StatusUnauthorized)
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(req.Password)); err != nil {
		http.Error(w, "Неверный логин или пароль", http.StatusUnauthorized)
		return
	}

	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &jwt.RegisteredClaims{
		Subject:   fmt.Sprint(userID),
		ExpiresAt: jwt.NewNumericDate(expirationTime),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, _ := token.SignedString(h.JwtKey)

	json.NewEncoder(w).Encode(map[string]string{"token": tokenString})
}
