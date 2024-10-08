// Package session provides primitives to interact with the openapi HTTP API.
//
// Code generated by github.com/deepmap/oapi-codegen version v1.9.1 DO NOT EDIT.
package session

import (
	"fmt"
	"net/http"

	externalRef0 "github.com/chack93/karteikarten_api/internal/domain/common"
	"github.com/deepmap/oapi-codegen/pkg/runtime"
	"github.com/labstack/echo/v4"
)

// Session defines model for Session.
type Session struct {
	// Embedded struct due to allOf(../common/common.yaml#/components/schemas/BaseModel)
	externalRef0.BaseModel `yaml:",inline"`
	// Embedded struct due to allOf(#/components/schemas/SessionNew)
	SessionNew `yaml:",inline"`
	// Embedded fields due to inline allOf schema
	JoinCode *string `json:"joinCode,omitempty"`
}

// SessionNew defines model for SessionNew.
type SessionNew struct {
	// Embedded fields due to inline allOf schema
	Csv         *string `json:"csv,omitempty"`
	Description *string `json:"description,omitempty"`
}

// CreateSessionJSONBody defines parameters for CreateSession.
type CreateSessionJSONBody SessionNew

// UpdateSessionJSONBody defines parameters for UpdateSession.
type UpdateSessionJSONBody SessionNew

// CreateSessionJSONRequestBody defines body for CreateSession for application/json ContentType.
type CreateSessionJSONRequestBody CreateSessionJSONBody

// UpdateSessionJSONRequestBody defines body for UpdateSession for application/json ContentType.
type UpdateSessionJSONRequestBody UpdateSessionJSONBody

// ServerInterface represents all server handlers.
type ServerInterface interface {

	// (POST /session)
	CreateSession(ctx echo.Context) error

	// (GET /session/join/{joinCode})
	ReadSessionJoinCode(ctx echo.Context, joinCode string) error

	// (GET /session/{id})
	ReadSession(ctx echo.Context, id string) error

	// (PUT /session/{id})
	UpdateSession(ctx echo.Context, id string) error
}

// ServerInterfaceWrapper converts echo contexts to parameters.
type ServerInterfaceWrapper struct {
	Handler ServerInterface
}

// CreateSession converts echo context to params.
func (w *ServerInterfaceWrapper) CreateSession(ctx echo.Context) error {
	var err error

	// Invoke the callback with all the unmarshalled arguments
	err = w.Handler.CreateSession(ctx)
	return err
}

// ReadSessionJoinCode converts echo context to params.
func (w *ServerInterfaceWrapper) ReadSessionJoinCode(ctx echo.Context) error {
	var err error
	// ------------- Path parameter "joinCode" -------------
	var joinCode string

	err = runtime.BindStyledParameterWithLocation("simple", false, "joinCode", runtime.ParamLocationPath, ctx.Param("joinCode"), &joinCode)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Invalid format for parameter joinCode: %s", err))
	}

	// Invoke the callback with all the unmarshalled arguments
	err = w.Handler.ReadSessionJoinCode(ctx, joinCode)
	return err
}

// ReadSession converts echo context to params.
func (w *ServerInterfaceWrapper) ReadSession(ctx echo.Context) error {
	var err error
	// ------------- Path parameter "id" -------------
	var id string

	err = runtime.BindStyledParameterWithLocation("simple", false, "id", runtime.ParamLocationPath, ctx.Param("id"), &id)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Invalid format for parameter id: %s", err))
	}

	// Invoke the callback with all the unmarshalled arguments
	err = w.Handler.ReadSession(ctx, id)
	return err
}

// UpdateSession converts echo context to params.
func (w *ServerInterfaceWrapper) UpdateSession(ctx echo.Context) error {
	var err error
	// ------------- Path parameter "id" -------------
	var id string

	err = runtime.BindStyledParameterWithLocation("simple", false, "id", runtime.ParamLocationPath, ctx.Param("id"), &id)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Invalid format for parameter id: %s", err))
	}

	// Invoke the callback with all the unmarshalled arguments
	err = w.Handler.UpdateSession(ctx, id)
	return err
}

// This is a simple interface which specifies echo.Route addition functions which
// are present on both echo.Echo and echo.Group, since we want to allow using
// either of them for path registration
type EchoRouter interface {
	CONNECT(path string, h echo.HandlerFunc, m ...echo.MiddlewareFunc) *echo.Route
	DELETE(path string, h echo.HandlerFunc, m ...echo.MiddlewareFunc) *echo.Route
	GET(path string, h echo.HandlerFunc, m ...echo.MiddlewareFunc) *echo.Route
	HEAD(path string, h echo.HandlerFunc, m ...echo.MiddlewareFunc) *echo.Route
	OPTIONS(path string, h echo.HandlerFunc, m ...echo.MiddlewareFunc) *echo.Route
	PATCH(path string, h echo.HandlerFunc, m ...echo.MiddlewareFunc) *echo.Route
	POST(path string, h echo.HandlerFunc, m ...echo.MiddlewareFunc) *echo.Route
	PUT(path string, h echo.HandlerFunc, m ...echo.MiddlewareFunc) *echo.Route
	TRACE(path string, h echo.HandlerFunc, m ...echo.MiddlewareFunc) *echo.Route
}

// RegisterHandlers adds each server route to the EchoRouter.
func RegisterHandlers(router EchoRouter, si ServerInterface) {
	RegisterHandlersWithBaseURL(router, si, "")
}

// Registers handlers, and prepends BaseURL to the paths, so that the paths
// can be served under a prefix.
func RegisterHandlersWithBaseURL(router EchoRouter, si ServerInterface, baseURL string) {

	wrapper := ServerInterfaceWrapper{
		Handler: si,
	}

	router.POST(baseURL+"/session", wrapper.CreateSession)
	router.GET(baseURL+"/session/join/:joinCode", wrapper.ReadSessionJoinCode)
	router.GET(baseURL+"/session/:id", wrapper.ReadSession)
	router.PUT(baseURL+"/session/:id", wrapper.UpdateSession)

}

