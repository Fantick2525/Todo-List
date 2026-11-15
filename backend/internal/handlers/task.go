package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/Fantick2525/Todo-List/backend/internal/database"
	"github.com/Fantick2525/Todo-List/backend/internal/middleware"
	"github.com/Fantick2525/Todo-List/backend/internal/models"
)

type TaskHandler struct{}

// 1. СОЗДАНИЕ ЗАДАЧИ
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

	task.UserID = userID
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

// 2. ПОЛУЧЕНИЕ СПИСКА ЗАДАЧ
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

// 3. РЕДАКТИРОВАНИЕ ЗАДАЧИ (НОВОЕ)
func (h *TaskHandler) UpdateTask(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(int)
	if !ok {
		http.Error(w, "Неавторизованный доступ", http.StatusUnauthorized)
		return
	}

	// Достаем ID задачи из URL (например, /tasks/5)
	idStr := strings.TrimPrefix(r.URL.Path, "/tasks/")
	taskID, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Неверный ID задачи", http.StatusBadRequest)
		return
	}

	var task models.Task
	if err := json.NewDecoder(r.Body).Decode(&task); err != nil {
		http.Error(w, "Неверный формат данных", http.StatusBadRequest)
		return
	}

	query := `UPDATE tasks SET name=$1, description=$2, priority=$3, deadline=$4 
	          WHERE id=$5 AND user_id=$6`

	var deadline interface{} = nil
	if !task.Deadline.IsZero() {
		deadline = task.Deadline
	}

	res, err := database.DB.Exec(query, task.Name, task.Description, task.Priority, deadline, taskID, userID)
	if err != nil {
		http.Error(w, "Ошибка обновления", http.StatusInternalServerError)
		return
	}

	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 0 {
		http.Error(w, "Задача не найдена или нет прав", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Задача обновлена"})
}

// 4. УДАЛЕНИЕ ЗАДАЧИ (НОВОЕ, Мягкое удаление)
func (h *TaskHandler) DeleteTask(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(int)
	if !ok {
		http.Error(w, "Неавторизованный доступ", http.StatusUnauthorized)
		return
	}

	idStr := strings.TrimPrefix(r.URL.Path, "/tasks/")

	query := `UPDATE tasks SET status='deleted' WHERE id=$1 AND user_id=$2`
	res, err := database.DB.Exec(query, idStr, userID)
	if err != nil {
		http.Error(w, "Ошибка удаления", http.StatusInternalServerError)
		return
	}

	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 0 {
		http.Error(w, "Задача не найдена", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Задача удалена"})
}
