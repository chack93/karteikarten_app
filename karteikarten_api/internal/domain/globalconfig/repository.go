package globalconfig

import (
	"errors"

	"github.com/chack93/karteikarten_api/internal/service/database"
	"gorm.io/gorm"
)

func createEmptyModel(key string) GlobalConfig {
	value := ""
	return GlobalConfig{Key: &key, Value: &value}
}

func CreateGlobalConfig(model *GlobalConfig) (err error) {
	model.SetInit()
	if err = database.Get().Create(model).Error; err != nil {
		log.Errorf("failed, err: %v", err)
	}
	return
}

func ReadGlobalConfig(key string, model *GlobalConfig) (err error) {
	if err = database.Get().Where("key = ?", key).First(&model).Error; err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		log.Errorf("failed, key: %s, err: %v", key, err)
		return
	}
	if errors.Is(err, gorm.ErrRecordNotFound) {
		*model = createEmptyModel(key)
		err = CreateGlobalConfig(model)
	}
	return
}

func UpdateGlobalConfig(model *GlobalConfig) (err error) {
	model.SetUpdate()
	if err = database.Get().Save(model).Error; err != nil {
		log.Errorf("failed, key: %s, err: %v", *model.Key, err)
	}
	return
}

func DeleteGlobalConfig(key string, model *GlobalConfig) (err error) {
	if err = ReadGlobalConfig(key, model); err != nil {
		log.Errorf("read failed, key: %s, err: %v", key, err)
		return
	}
	if err = database.Get().Delete(model).Error; err != nil {
		log.Errorf("failed, key: %s, err: %v", key, err)
	}
	return
}
