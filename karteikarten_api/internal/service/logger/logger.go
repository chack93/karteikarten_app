package logger

import (
	"fmt"
	"path"
	"runtime"
	"strings"

	"github.com/sirupsen/logrus"
	"github.com/spf13/viper"
)

var logger struct {
	log *logrus.Logger
}

func Init() error {
	l := Get()
	if viper.GetString("log.format") == "json" {
		l.SetFormatter(&logrus.JSONFormatter{})
	} else {
		l.SetReportCaller(true)
		l.SetFormatter(&logrus.TextFormatter{
			CallerPrettyfier: func(f *runtime.Frame) (string, string) {
				filename := path.Base(f.File)
				modDotPos := strings.LastIndex(filename, ".")
				funcName := path.Base(f.Function)
				funcDotPos := strings.LastIndex(funcName, ".")
				return fmt.Sprintf("[%s/%s]", filename[:modDotPos], funcName[funcDotPos+1:]), ""
			},
		})
	}

	switch viper.GetString("log.level") {
	case "debug":
		l.SetLevel(logrus.DebugLevel)
	case "info":
		l.SetLevel(logrus.InfoLevel)
	case "warn":
		l.SetLevel(logrus.WarnLevel)
	case "error":
		l.SetLevel(logrus.ErrorLevel)
	case "fatal":
		l.SetLevel(logrus.FatalLevel)
	default:
		l.SetLevel(logrus.TraceLevel)
	}

	return nil
}

func Get() *logrus.Logger {
	if logger.log == nil {
		logger.log = logrus.New()
		Init()
	}
	return logger.log
}
