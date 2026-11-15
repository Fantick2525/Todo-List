package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/Fantick2525/Todo-List/backend/internal/database"
	"github.com/Fantick2525/Todo-List/backend/internal/middleware"
	"github.com/Fantick2525/Todo-List/backend/internal/models"
)

type TaskHandler struct{}

// СОЗДАНИЕ ЗАДАЧИ
func (h *TaskHandler) CreateTask(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(int)
	if !ok {
		http.Error(w, "Неавторизованный доступ", http.StatusUnauthorized)
		return
	}

	var task models.Task
	if err := json.NewDecoder(r.Body).Decode(&task); err != nil {
		http.Error(w, "Неверный формат данных", http.StatusBadRequest)
		return
	}

	task.UserID = userID // Берем ID из контекста
	if task.Status == "" {
		task.Status = "active"
	}
	task.DateCreated = time.Now()

	query := `INSERT INTO tasks (user_id, name, description, deadline, priority, status, date_created) 
	          VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`

	var deadline interface{} = nil
	if !task.Deadline.IsZero() {
		deadline = task.Deadline
	}

	err := database.DB.QueryRow(query, task.UserID, task.Name, task.Description, deadline, task.Priority, task.Status, task.DateCreated).Scan(&task.ID)
	if err != nil {
		http.Error(w, "Ошибка сохранения в БД", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(task)
}

// ПОЛУЧЕНИЕ СПИСКА ЗАДАЧ
func (h *TaskHandler) GetTasks(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(int)
	if !ok {
		http.Error(w, "Неавторизованный доступ", http.StatusUnauthorized)
		return
	}

	query := `SELECT id, user_id, name, description, deadline, priority, status, date_created 
	          FROM tasks WHERE user_id = $1 AND status != 'deleted'`

	rows, err := database.DB.Query(query, userID)
	if err != nil {
		http.Error(w, "Ошибка чтения БД", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var tasks []models.Task
	for rows.Next() {
		var t models.Task
		rows.Scan(&t.ID, &t.UserID, &t.Name, &t.Description, &t.Deadline, &t.Priority, &t.Status, &t.DateCreated)
		tasks = append(tasks, t)
	}

	json.NewEncoder(w).Encode(tasks)
}
