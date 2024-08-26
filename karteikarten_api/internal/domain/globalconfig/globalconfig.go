package globalconfig

import (
	"github.com/chack93/karteikarten_api/internal/domain/common"
	"github.com/chack93/karteikarten_api/internal/service/logger"
)

var log = logger.Get()

// GlobalConfig defines model for GlobalConfig.
type GlobalConfig struct {
	common.BaseModel `yaml:",inline"`
	Key              *string `json:"key,omitempty"`
	Value            *string `json:"Value,omitempty"`
}

// GlobalConfigList defines model for GlobalConfigList.
type GlobalConfigList []GlobalConfig
