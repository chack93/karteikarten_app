package session

import (
	"crypto/sha256"
	"encoding/base32"
	"math/big"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

type ServerInterfaceImpl struct{}

func (*ServerInterfaceImpl) CreateSession(ctx echo.Context) error {
	var requestBody CreateSessionJSONRequestBody
	if err := ctx.Bind(&requestBody); err != nil {
		log.Infof("bind body failed: %v", err)
		return echo.NewHTTPError(http.StatusBadRequest, "bad body, expected format: Session.json")
	}
	var newEntry = Session{}
	hash := sha256.New().Sum(big.NewInt(time.Now().UnixNano()).Bytes())
	joinCode := base32.StdEncoding.EncodeToString(hash)[:8]
	newEntry.JoinCode = &joinCode
	newEntry.Description = requestBody.Description
	newEntry.Csv = requestBody.Csv
	if err := CreateSession(&newEntry); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to create")
	}
	return ctx.JSON(http.StatusOK, newEntry)
}

func (*ServerInterfaceImpl) ReadSession(ctx echo.Context, id string) error {
	uuid, err := uuid.Parse(id)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "bad id, expected format: uuid")
	}
	var response Session
	if err := ReadSession(uuid, &response); err != nil {
		if err == gorm.ErrRecordNotFound {
			return echo.NewHTTPError(http.StatusNotFound)
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to read")
	}
	return ctx.JSON(http.StatusOK, response)
}

func (*ServerInterfaceImpl) ReadSessionJoinCode(ctx echo.Context, joinCode string) error {
	var response Session
	if err := ReadSessionJoinCode(joinCode, &response); err != nil {
		if err == gorm.ErrRecordNotFound {
			return echo.NewHTTPError(http.StatusNotFound)
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to read")
	}
	return ctx.JSON(http.StatusOK, response)
}

func (*ServerInterfaceImpl) UpdateSession(ctx echo.Context, id string) error {
	uuid, err := uuid.Parse(id)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "bad id, expected format: uuid")
	}
	var session Session
	if err := ReadSession(uuid, &session); err != nil {
		if err == gorm.ErrRecordNotFound {
			return echo.NewHTTPError(http.StatusNotFound)
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to read")
	}

	var requestBody UpdateSessionJSONRequestBody
	if err := ctx.Bind(&requestBody); err != nil {
		log.Infof("bind body failed: %v", err)
		return echo.NewHTTPError(http.StatusBadRequest, "bad body, expected format: Session.json")
	}
	session.Description = requestBody.Description
	session.Csv = requestBody.Csv
	if err := UpdateSession(uuid, &session); err != nil {
		if err == gorm.ErrRecordNotFound {
			return echo.NewHTTPError(http.StatusNotFound)
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to update")
	}
	return ctx.NoContent(http.StatusNoContent)
}
