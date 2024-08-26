package msgsystem

import (
	"sync"

	"github.com/chack93/karteikarten_api/internal/service/logger"
	"github.com/nats-io/nats.go"
	"github.com/spf13/viper"
)

var log = logger.Get()
var lock = &sync.Mutex{}

type msgsystem struct {
	Conn *nats.Conn
}

var natsInstance *msgsystem

func Get() *nats.Conn {
	if natsInstance == nil {
		New()
	}
	return natsInstance.Conn
}

func New() *msgsystem {
	if natsInstance == nil {
		lock.Lock()
		defer lock.Unlock()
		if natsInstance == nil {
			natsInstance = &msgsystem{}
		}
	}
	return natsInstance
}

func (s *msgsystem) Init() error {
	natsUrl := viper.GetString("msgqueue.nats.url")
	conn, err := nats.Connect(natsUrl)
	if err != nil {
		log.Errorf("connect to nats-server failed, err: %v", err)
		return err
	}
	s.Conn = conn

	log.Infof("connected to nats-server: %s", natsUrl)
	return nil
}
