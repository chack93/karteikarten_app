package domain

import (
	"github.com/chack93/karteikarten_api/internal/domain/client"
	"github.com/chack93/karteikarten_api/internal/domain/globalconfig"
	"github.com/chack93/karteikarten_api/internal/domain/session"
	"github.com/chack93/karteikarten_api/internal/service/database"
	"github.com/labstack/echo/v4"
)

func Init() error {
	db := database.Get()
	db.AutoMigrate(&session.Session{})
	db.AutoMigrate(&client.Client{})
	db.AutoMigrate(&globalconfig.GlobalConfig{})

	return nil
}

func RegisterHandlers(e *echo.Echo, baseURL string) {
	session.RegisterHandlersWithBaseURL(e, &session.ServerInterfaceImpl{}, baseURL)
	client.RegisterHandlersWithBaseURL(e, &client.ServerInterfaceImpl{}, baseURL)
}
