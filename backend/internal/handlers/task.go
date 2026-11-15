package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/Fantick2525/Todo-List/backend/internal/database"
	"github.com/Fantick2525/Todo-List/backend/internal/models"
)

type TaskHandler struct{}

// СОЗДАНИЕ ЗАДАЧИ
func (h *TaskHandler) CreateTask(w http.ResponseWriter, r *http.Request) {
	var task models.Task
	if err := json.NewDecoder(r.Body).Decode(&task); err != nil {
		http.Error(w, "Неверный формат данных", http.StatusBadRequest)
		return
	}

	if task.Status == "" {
		task.Status = "active"
	}
	task.DateCreated = time.Now()

	query := `INSERT INTO tasks (user_id, name, description, deadline, priority, status, date_created) 
	          VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`

	// Обработка пустого дедлайна
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

// УДАЛЕНИЕ ЗАДАЧИ (Мягкое удаление)
func (h *TaskHandler) DeleteTask(w http.ResponseWriter, r *http.Request) {
	// Получаем ID из URL
	id := r.URL.Path[len("/tasks/"):]

	// Меняем статус на deleted вместо физического удаления
	_, err := database.DB.Exec("UPDATE tasks SET status='deleted' WHERE id=$1", id)
	if err != nil {
		http.Error(w, "Ошибка удаления", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Задача удалена"})
}
