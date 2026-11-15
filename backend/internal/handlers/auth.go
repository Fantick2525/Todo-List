package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/Fantick2525/Todo-List/backend/internal/models"
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
		http.Error(w, "Неверный формат", http.StatusBadRequest)
		return
	}

	models.Mutex.Lock()
	defer models.Mutex.Unlock()

	if _, exists := models.Users[req.Login]; exists {
		http.Error(w, "Пользователь уже есть", http.StatusConflict)
		return
	}

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	models.Users[req.Login] = models.User{
		ID: models.UserID, Login: req.Login, Email: req.Email, Password: string(hashedPassword), DateCreated: time.Now(),
	}
	models.UserID++

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Успешная регистрация"})
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Login    string `json:"login"`
		Password string `json:"password"`
	}
	json.NewDecoder(r.Body).Decode(&req)

	models.Mutex.Lock()
	user, exists := models.Users[req.Login]
	models.Mutex.Unlock()

	if !exists || bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)) != nil {
		http.Error(w, "Неверный логин или пароль", http.StatusUnauthorized)
		return
	}

	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &jwt.RegisteredClaims{
		Subject:   fmt.Sprint(user.ID),
		ExpiresAt: jwt.NewNumericDate(expirationTime),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, _ := token.SignedString(h.JwtKey)

	json.NewEncoder(w).Encode(map[string]string{"token": tokenString})
}

func (h *AuthHandler) ForgotPassword(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email string `json:"email"`
	}
	json.NewDecoder(r.Body).Decode(&req)

	models.Mutex.Lock()
	defer models.Mutex.Unlock()

	for _, user := range models.Users {
		if user.Email == req.Email {
			json.NewEncoder(w).Encode(map[string]string{
				"message": "Токен сгенерирован",
				"token":   "reset_token_" + user.Login,
			})
			return
		}
	}
	http.Error(w, "Email не найден", http.StatusNotFound)
}

func (h *AuthHandler) ResetPassword(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Token       string `json:"token"`
		NewPassword string `json:"new_password"`
	}
	json.NewDecoder(r.Body).Decode(&req)

	login := req.Token[len("reset_token_"):]

	models.Mutex.Lock()
	defer models.Mutex.Unlock()

	user, exists := models.Users[login]
	if !exists || req.Token != "reset_token_"+login {
		http.Error(w, "Неверный токен", http.StatusBadRequest)
		return
	}

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	user.Password = string(hashedPassword)
	models.Users[login] = user

	json.NewEncoder(w).Encode(map[string]string{"message": "Пароль изменен"})
}
