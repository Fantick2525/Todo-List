package models

import (
	"sync"
	"time"
)

type User struct {
	ID          int       `json:"id"`
	Login       string    `json:"login"`
	Email       string    `json:"email"`
	Password    string    `json:"-"`
	DateCreated time.Time `json:"date_created"`
}

var (
	Users  = make(map[string]User)
	UserID = 1
	Mutex  sync.Mutex
)
