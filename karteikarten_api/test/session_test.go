package test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/chack93/karteikarten_api/internal/domain/session"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

func TestSessionCRUD(t *testing.T) {
	var ctx echo.Context
	var rec *httptest.ResponseRecorder
	var baseURL = "/api/karteikarten_api/session/"
	var impl = session.ServerInterfaceImpl{}

	// CREATE
	var respCreate session.Session
	var descCreate = "new session"
	var csvCreate = "q,a\nquestion 1,answer 1"
	ctx, rec = Request("POST", baseURL, session.CreateSessionJSONRequestBody{
		Description: &descCreate,
		Csv:         &csvCreate,
	})
	assert.NoError(t, impl.CreateSession(ctx))
	assert.Equal(t, http.StatusOK, rec.Code)
	assert.NoError(t, json.Unmarshal(rec.Body.Bytes(), &respCreate))
	assert.True(t, respCreate.JoinCode != nil)
	assert.Equal(t, 8, len(*respCreate.JoinCode))
	assert.Equal(t, descCreate, *respCreate.Description)
	assert.Equal(t, csvCreate, *respCreate.Csv)

	// READ
	ctx, rec = Request("GET", baseURL+":id", nil)
	assert.NoError(t, impl.ReadSession(ctx, respCreate.ID.String()))
	assert.Equal(t, http.StatusOK, rec.Code)
	var respRead session.Session
	assert.NoError(t, json.Unmarshal(rec.Body.Bytes(), &respRead))
	assert.Equal(t, *respCreate.JoinCode, *respRead.JoinCode)
	assert.Equal(t, *respCreate.Description, *respRead.Description)
	assert.Equal(t, *respCreate.Csv, *respRead.Csv)

	// READ JOINCODE
	ctx, rec = Request("GET", baseURL+"/join/:joinCode", nil)
	assert.NoError(t, impl.ReadSessionJoinCode(ctx, *respCreate.JoinCode))
	assert.Equal(t, http.StatusOK, rec.Code)
	var respReadJoinCode session.Session
	assert.NoError(t, json.Unmarshal(rec.Body.Bytes(), &respReadJoinCode))
	assert.Equal(t, respCreate.ID.String(), respReadJoinCode.ID.String())
	assert.Equal(t, *respCreate.JoinCode, *respReadJoinCode.JoinCode)
	assert.Equal(t, *respCreate.Description, *respReadJoinCode.Description)
	assert.Equal(t, *respCreate.Csv, *respReadJoinCode.Csv)

	// UPDATE
	var descUpdate = "updated description"
	var csvUpdate = "q,a\nquestion 1,answer 1\nquestion 2,answer 2"
	ctx, rec = Request("PUT", baseURL+":id", session.UpdateSessionJSONRequestBody{
		Description: &descUpdate,
		Csv:         &csvUpdate,
	})
	assert.NoError(t, impl.UpdateSession(
		ctx,
		respCreate.ID.String(),
	))
	assert.Equal(t, http.StatusNoContent, rec.Code)
	// UPDATE-READ
	ctx, rec = Request("GET", baseURL+":id", nil)
	assert.NoError(t, impl.ReadSession(ctx, respCreate.ID.String()))
	assert.Equal(t, http.StatusOK, rec.Code)
	var respUpdate session.Session
	assert.NoError(t, json.Unmarshal(rec.Body.Bytes(), &respUpdate))
	assert.Equal(t, *respCreate.JoinCode, *respUpdate.JoinCode)
	assert.Equal(t, descUpdate, *respUpdate.Description)
	assert.Equal(t, csvUpdate, *respUpdate.Csv)

}
