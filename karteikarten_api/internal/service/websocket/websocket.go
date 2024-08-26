package websocket

import (
	_ "embed"
	"encoding/json"
	"errors"
	"fmt"
	"net"

	"github.com/chack93/karteikarten_api/internal/domain/socketmsg"
	"github.com/chack93/karteikarten_api/internal/service/logger"
	"github.com/chack93/karteikarten_api/internal/service/msgsystem"
	"github.com/gobwas/ws"
	"github.com/gobwas/ws/wsutil"
	"github.com/nats-io/nats.go"
)

var log = logger.Get()

// CreateHandler forward messages from client
func CreateHandler(conn net.Conn, clientID string, groupID string) {
	go func() {
		defer conn.Close()
		reader := wsutil.NewReader(conn, ws.StateServerSide)
		writer := wsutil.NewWriter(conn, ws.StateServerSide, ws.OpText)
		decoder := json.NewDecoder(reader)
		encoder := json.NewEncoder(writer)
		msgSys := msgsystem.Get()

		// send init message
		log.Infof("[open] connection opened, clientID: %s", clientID)
		natsMsg := nats.NewMsg("karteikarten_api.client-request")
		natsMsg.Header.Add("clientID", clientID)
		natsMsg.Header.Add("groupID", groupID)
		natsMsg.Header.Add("action", "open")
		msgSys.PublishMsg(natsMsg)

		// forware messages to client
		msgSys.Subscribe(fmt.Sprintf("karteikarten_api.client-response.%s", clientID), func(msg *nats.Msg) {
			responseMsg := msg.Data
			if len(responseMsg) < 1 {
				responseMsg = []byte("{}")
			}
			response := socketmsg.SocketMsg{
				Head: socketmsg.SocketMsgHead{
					ClientID: msg.Header.Get("clientID"),
					GroupID:  msg.Header.Get("groupID"),
					Action:   msg.Header.Get("action"),
				},
				Body: responseMsg,
			}
			if err := encoder.Encode(response); err != nil {
				log.Errorf("[tx] failed to write response data, clientID: %s, err: %v", clientID, err)
				if errors.Is(err, net.ErrClosed) {
					msg.Sub.Unsubscribe()
					natsMsg := nats.NewMsg("karteikarten_api.client-request")
					natsMsg.Header.Add("clientID", clientID)
					natsMsg.Header.Add("groupID", groupID)
					natsMsg.Header.Add("action", "close")
					msgSys.PublishMsg(natsMsg)
					return
				}
			}
			if err := writer.Flush(); err != nil {
				log.Errorf("[tx] failed to flush response data, clientID: %s, err: %v", clientID, err)
				if errors.Is(err, net.ErrClosed) {
					msg.Sub.Unsubscribe()
					natsMsg := nats.NewMsg("karteikarten_api.client-request")
					natsMsg.Header.Add("clientID", clientID)
					natsMsg.Header.Add("groupID", groupID)
					natsMsg.Header.Add("action", "close")
					msgSys.PublishMsg(natsMsg)
					return
				}
			}
		})

		// forward client message to handler
		for {
			header, err := reader.NextFrame()
			if err != nil {
				log.Errorf("[rx] failed to read next frame, err: %v", err)
				return
			}
			if header.OpCode == ws.OpClose {
				log.Errorf("[rx] connection closed, clientID: %s", clientID)
				natsMsg := nats.NewMsg("karteikarten_api.client-request")
				natsMsg.Header.Add("clientID", clientID)
				natsMsg.Header.Add("groupID", groupID)
				natsMsg.Header.Add("action", "close")
				msgSys.PublishMsg(natsMsg)
				return
			}

			var wsMsg socketmsg.SocketMsg
			if err := decoder.Decode(&wsMsg); err != nil {
				log.Errorf("[rx] failed to decode socket msg, err: %v", err)
				continue
			}
			natsMsg := nats.NewMsg("karteikarten_api.client-request")
			natsMsg.Header.Add("clientID", wsMsg.Head.ClientID)
			natsMsg.Header.Add("groupID", wsMsg.Head.GroupID)
			natsMsg.Header.Add("action", wsMsg.Head.Action)
			natsMsg.Data = wsMsg.Body
			msgSys.PublishMsg(natsMsg)
		}
	}()
}
