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

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(task)
}

// УДАЛЕНИЕ ЗАДАЧИ (Мягкое удаление)
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

	json.NewEncoder(w).Encode(map[string]string{"message": "Задача удалена"})
}
