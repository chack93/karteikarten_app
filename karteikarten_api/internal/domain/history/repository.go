package history

import (
	"github.com/chack93/karteikarten_api/internal/service/database"
	"github.com/google/uuid"
)

func CreateHistory(model *History) (err error) {
	model.SetInit()
	if err = database.Get().Create(model).Error; err != nil {
		log.Errorf("failed, err: %v", err)
	}
	return
}

func ListHistoryBySessionID(sessionID uuid.UUID, modelList *[]History) (err error) {
	if err = database.Get().Where("session_id = ?", sessionID).Find(modelList).Error; err != nil {
		log.Errorf("failed, err: %v", err)
	}
	return
}

func ReadHistory(id uuid.UUID, model *History) (err error) {
	if err = database.Get().First(&model, id).Error; err != nil {
		log.Errorf("failed, id: %s, err: %v", id.String(), err)
	}
	return
}

func UpdateHistory(id uuid.UUID, model *History) (err error) {
	model.SetUpdate()
	if err = database.Get().Save(model).Error; err != nil {
		log.Errorf("failed, id: %s, err: %v", model.ID.String(), err)
	}
	return
}

func DeleteHistory(id uuid.UUID, model *History) (err error) {
	if err = ReadHistory(id, model); err != nil {
		log.Errorf("read failed, id: %s, err: %v", model.ID.String(), err)
		return
	}
	if err = database.Get().Delete(model).Error; err != nil {
		log.Errorf("failed, id: %s, err: %v", model.ID.String(), err)
	}
	return
}
