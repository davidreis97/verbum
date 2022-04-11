package log

import (
	"github.com/centrifugal/centrifuge"
	"github.com/davidreis97/verbum/verbum-gamehost/src/config"
	"go.uber.org/zap"
)

var Logger *zap.Logger

func init() {
	if config.IsProd() {
		config := zap.NewProductionConfig()
		config.OutputPaths = []string{"stdout"}
		config.Level = zap.NewAtomicLevelAt(zap.DebugLevel)

		Logger, _ = config.Build()
	} else {
		Logger, _ = zap.NewDevelopment()
	}
}

func map2fields(m map[string]interface{}, fields []zap.Field) []zap.Field {
	for k, v := range m {
		switch child := v.(type) {
		case map[string]interface{}:
			fields = append(fields, map2fields(child, fields)...)
		default:
			fields = append(fields, zap.Any(k, v))
		}
	}

	return fields
}

func HandleCentrifugeLog(e centrifuge.LogEntry) {
	fields := make([]zap.Field, 0, len(e.Fields))

	switch e.Level {
	case centrifuge.LogLevelTrace:
	case centrifuge.LogLevelDebug:
		Logger.Debug(e.Message, map2fields(e.Fields, fields)...)
		break
	case centrifuge.LogLevelInfo:
		Logger.Info(e.Message, map2fields(e.Fields, fields)...)
		break
	case centrifuge.LogLevelWarn:
		Logger.Warn(e.Message, map2fields(e.Fields, fields)...)
		break
	case centrifuge.LogLevelError:
		Logger.Error(e.Message, map2fields(e.Fields, fields)...)
		break
	}
}
