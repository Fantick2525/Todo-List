package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/Fantick2525/Todo-List/backend/internal/database"
	"github.com/Fantick2525/Todo-List/backend/internal/models"
)

type TaskHandler struct{}

// ПОЛУЧЕНИЕ ВСЕХ ЗАДАЧ ПОЛЬЗОВАТЕЛЯ
func (h *TaskHandler) GetTasks(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Метод не разрешен", http.StatusMethodNotAllowed)
		return
	}

	userIDStr, ok := r.Context().Value("userID").(string)
	if !ok {
		http.Error(w, "Не авторизован", http.StatusUnauthorized)
		return
	}
	userID, _ := strconv.Atoi(userIDStr)

	rows, err := database.DB.Query(
		`SELECT id, user_id, name, coalesce(description, ''), coalesce(deadline, CURRENT_TIMESTAMP), priority, status, date_created 
		 FROM tasks WHERE user_id=$1 ORDER BY id DESC`, userID)
	if err != nil {
		http.Error(w, "Ошибка получения задач", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	tasks := []models.Task{}
	for rows.Next() {
		var t models.Task
		if err := rows.Scan(&t.ID, &t.UserID, &t.Name, &t.Description, &t.Deadline, &t.Priority, &t.Status, &t.DateCreated); err != nil {
			continue
		}
		tasks = append(tasks, t)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tasks)
}

// СОЗДАНИЕ ЗАДАЧИ
func (h *TaskHandler) CreateTask(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Метод не разрешен", http.StatusMethodNotAllowed)
		return
	}

	var task models.Task
	if err := json.NewDecoder(r.Body).Decode(&task); err != nil {
		http.Error(w, "Неверный формат данных", http.StatusBadRequest)
		return
	}

	// БЕРЕМ ID ИЗ КОНТЕКСТА (Middleware), а не из JSON!
	userIDStr := r.Context().Value("userID").(string)
	userID, _ := strconv.Atoi(userIDStr)

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

	err := database.DB.QueryRow(query, userID, task.Name, task.Description, deadline, task.Priority, task.Status, task.DateCreated).Scan(&task.ID)
	if err != nil {
		http.Error(w, "Ошибка сохранения в БД", http.StatusInternalServerError)
		return
	}

	task.UserID = userID // Возвращаем в ответе правильный ID

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(task)
}

// ОБНОВЛЕНИЕ ЗАДАЧИ
func (h *TaskHandler) UpdateTask(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut && r.Method != http.MethodPatch {
		http.Error(w, "Метод не разрешен", http.StatusMethodNotAllowed)
		return
	}

	idStr := strings.TrimPrefix(r.URL.Path, "/tasks/")
	taskID, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Неверный ID задачи", http.StatusBadRequest)
		return
	}

	userIDStr := r.Context().Value("userID").(string)
	userID, _ := strconv.Atoi(userIDStr)

	var req struct {
		Name        *string          `json:"name"`
		Description *string          `json:"description"`
		Priority    *models.Priority `json:"priority"`
		Status      *string          `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Неверный формат данных", http.StatusBadRequest)
		return
	}

	if req.Status != nil {
		database.DB.Exec("UPDATE tasks SET status=$1 WHERE id=$2 AND user_id=$3", *req.Status, taskID, userID)
	}
	if req.Name != nil {
		database.DB.Exec("UPDATE tasks SET name=$1 WHERE id=$2 AND user_id=$3", *req.Name, taskID, userID)
	}
	if req.Description != nil {
		database.DB.Exec("UPDATE tasks SET description=$1 WHERE id=$2 AND user_id=$3", *req.Description, taskID, userID)
	}
	if req.Priority != nil {
		database.DB.Exec("UPDATE tasks SET priority=$1 WHERE id=$2 AND user_id=$3", *req.Priority, taskID, userID)
	}

	var task models.Task
	err = database.DB.QueryRow(
		`SELECT id, user_id, name, coalesce(description, ''), coalesce(deadline, CURRENT_TIMESTAMP), priority, status, date_created 
		 FROM tasks WHERE id=$1 AND user_id=$2`, taskID, userID).
		Scan(&task.ID, &task.UserID, &task.Name, &task.Description, &task.Deadline, &task.Priority, &task.Status, &task.DateCreated)
	if err != nil {
		http.Error(w, "Задача не найдена", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(task)
}

// УДАЛЕНИЕ ЗАДАЧИ
func (h *TaskHandler) DeleteTask(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Метод не разрешен", http.StatusMethodNotAllowed)
		return
	}

	// Достаем ID задачи из URL (/tasks/123)
	idStr := strings.TrimPrefix(r.URL.Path, "/tasks/")
	taskID, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Неверный ID задачи", http.StatusBadRequest)
		return
	}

	// Берем ID пользователя из контекста
	userIDStr := r.Context().Value("userID").(string)
	userID, _ := strconv.Atoi(userIDStr)

	// Удаляем только если задача принадлежит этому пользователю!
	query := `UPDATE tasks SET status='deleted' WHERE id=$1 AND user_id=$2`
	res, err := database.DB.Exec(query, taskID, userID)
	if err != nil {
		http.Error(w, "Ошибка удаления", http.StatusInternalServerError)
		return
	}

	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 0 {
		http.Error(w, "Задача не найдена или нет прав", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Задача удалена"})
}
