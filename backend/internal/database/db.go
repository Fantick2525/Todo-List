package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

var DB *sql.DB

func InitDB() {
	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		os.Getenv("DB_HOST"), os.Getenv("DB_PORT"), os.Getenv("DB_USER"), os.Getenv("DB_PASSWORD"), os.Getenv("DB_NAME"))

	var err error
	DB, err = sql.Open("postgres", dsn)
	if err != nil {
		log.Fatal("Ошибка подключения к БД:", err)
	}

	if err = DB.Ping(); err != nil {
		log.Fatal("База данных не отвечает:", err)
	}
	fmt.Println("Успешно подключились к PostgreSQL!")

	// 1. Создаем таблицу пользователей
	queryUsers := `
	CREATE TABLE IF NOT EXISTS users (
		id SERIAL PRIMARY KEY,
		login VARCHAR(50) UNIQUE NOT NULL,
		email VARCHAR(100) UNIQUE NOT NULL,
		password VARCHAR(100) NOT NULL,
		date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);`
	_, err = DB.Exec(queryUsers)
	if err != nil {
		log.Fatal("Ошибка создания таблицы users:", err)
	}
	fmt.Println("Таблица users готова к работе!")

	// 2. Создаем таблицу задач
	queryTasks := `
	CREATE TABLE IF NOT EXISTS tasks (
		id SERIAL PRIMARY KEY,
		user_id INT NOT NULL,
		name VARCHAR(255) NOT NULL,
		description TEXT,
		deadline TIMESTAMP,
		priority VARCHAR(20) DEFAULT 'medium',
		status VARCHAR(20) DEFAULT 'active',
		date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);`
	_, err = DB.Exec(queryTasks)
	if err != nil {
		log.Fatal("Ошибка создания таблицы tasks:", err)
	}
	fmt.Println("Таблица tasks готова к работе!")
}
