package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
)

// Описание юзера
type User struct {
	ID          int       `json:"id"`
	Login       string    `json:"login"`
	Email       string    `json:"email"`
	Password    string    `json:"-"`
	DateCreated time.Time `json:"date_created"`
}

// Временное хранилище
var (
	Users  = make(map[string]User) // ключ - логин
	UserID = 1
	Mutex  sync.Mutex
	JwtKey []byte
	Port   string
)

// Загрузка конфига при старте
func init() {
	if err := godotenv.Load(); err != nil {
		log.Println("Файл .env не найден, используем дефолтные настройки")
	}
	JwtKey = []byte(os.Getenv("JWT_SECRET"))
	if len(JwtKey) == 0 {
		JwtKey = []byte("default_secret")
	}
	Port = os.Getenv("PORT")
	if Port == "" {
		Port = "8080"
	}
}

// Хендлер Регистрации
func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Login    string `json:"login"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Неверный формат данных", http.StatusBadRequest)
		return
	}

	Mutex.Lock()
	defer Mutex.Unlock()

	if _, exists := Users[req.Login]; exists {
		http.Error(w, "Пользователь уже существует", http.StatusConflict)
		return
	}

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	Users[req.Login] = User{
		ID: UserID, Login: req.Login, Email: req.Email, Password: string(hashedPassword), DateCreated: time.Now(),
	}
	UserID++

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Успешная регистрация"})
}

// Хендлер Авторизации
func LoginHandler(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Login    string `json:"login"`
		Password string `json:"password"`
	}
	json.NewDecoder(r.Body).Decode(&req)

	Mutex.Lock()
	user, exists := Users[req.Login]
	Mutex.Unlock()

	if !exists {
		http.Error(w, "Неверный логин или пароль", http.StatusUnauthorized)
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		http.Error(w, "Неверный логин или пароль", http.StatusUnauthorized)
		return
	}

	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &jwt.RegisteredClaims{
		Subject:   fmt.Sprint(user.ID),
		ExpiresAt: jwt.NewNumericDate(expirationTime),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, _ := token.SignedString(JwtKey)

	json.NewEncoder(w).Encode(map[string]string{"token": tokenString})
}

// Востановление пароля
func ForgotPasswordHandler(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email string `json:"email"`
	}
	json.NewDecoder(r.Body).Decode(&req)

	Mutex.Lock()
	defer Mutex.Unlock()

	// Проверяем, есть ли такой email
	for _, user := range Users {
		if user.Email == req.Email {
			// Для MVP просто возвращаем токен. В реальности - отправка на почту.
			resetToken := "reset_token_" + user.Login
			json.NewEncoder(w).Encode(map[string]string{
				"message": "Токен для сброса пароля сгенерирован",
				"token":   resetToken,
			})
			return
		}
	}
	http.Error(w, "Пользователь с таким email не найден", http.StatusNotFound)
}

func ResetPasswordHandler(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Token       string `json:"token"`
		NewPassword string `json:"new_password"`
	}
	json.NewDecoder(r.Body).Decode(&req)

	// Извлекаем логин из токена
	login := req.Token[len("reset_token_"):]

	Mutex.Lock()
	defer Mutex.Unlock()

	user, exists := Users[login]
	if !exists || req.Token != "reset_token_"+login {
		http.Error(w, "Неверный токен", http.StatusBadRequest)
		return
	}

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	user.Password = string(hashedPassword)
	Users[login] = user

	json.NewEncoder(w).Encode(map[string]string{"message": "Пароль успешно изменен"})
}

func main() {
	http.HandleFunc("/register", RegisterHandler)
	http.HandleFunc("/login", LoginHandler)
	http.HandleFunc("/forgot-password", ForgotPasswordHandler)
	http.HandleFunc("/reset-password", ResetPasswordHandler)

	fmt.Printf("Сервер запущен на порту %s...\n", Port)
	http.ListenAndServe(":"+Port, nil)
}
