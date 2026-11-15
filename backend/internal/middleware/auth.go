package middleware

import (
	"context"
	"net/http"
	"strconv"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

// Ключ, по которому мы будем доставать userID из контекста
// Использование отдельного типа для ключа — хорошая практика, чтобы избежать коллизий
type contextKey string

const UserIDKey contextKey = "user_id"

func AuthMiddleware(jwtSecret []byte) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				http.Error(w, "Требуется авторизация", http.StatusUnauthorized)
				return
			}

			parts := strings.Split(authHeader, " ")
			if len(parts) != 2 || parts[0] != "Bearer" {
				http.Error(w, "Неверный формат токена", http.StatusUnauthorized)
				return
			}

			tokenString := parts[1]
			// Парсим токен и явно указываем, что хотим получить RegisteredClaims
			token, err := jwt.ParseWithClaims(tokenString, &jwt.RegisteredClaims{}, func(token *jwt.Token) (interface{}, error) {
				return jwtSecret, nil
			})

			if err != nil || !token.Valid {
				http.Error(w, "Неверный или просроченный токен", http.StatusUnauthorized)
				return
			}

			// Достаем claims из токена
			claims, ok := token.Claims.(*jwt.RegisteredClaims)
			if !ok {
				http.Error(w, "Неверные данные в токене", http.StatusUnauthorized)
				return
			}

			// В твоем коде при создании токена в Subject записывается ID пользователя
			// (см. функцию Login в handlers/auth.go)
			userID, err := strconv.Atoi(claims.Subject)
			if err != nil {
				http.Error(w, "Неверный ID пользователя в токене", http.StatusUnauthorized)
				return
			}

			// Кладем userID в контекст запроса
			ctx := context.WithValue(r.Context(), UserIDKey, userID)

			// Передаем запрос дальше с новым контекстом
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
