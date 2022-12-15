import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageDto } from './dto/new-message.dto';
import { MessagesWsService } from './messages-ws.service';

@WebSocketGateway({
  cors: true,
  //namespace: '9789',
})
export class MessagesWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() websocketServer: Server;

  constructor(private readonly messagesWsService: MessagesWsService) {}

  handleConnection(client: Socket) {
    console.log(`Connected ${client.id}`);
    this.messagesWsService.registerClient(client);
    this.websocketServer.emit('clients-updated', 
      this.messagesWsService.getConnectionClients());
  }
  handleDisconnect(client: Socket) {
    console.log(`Disconnected ${client.id}`);
    this.messagesWsService.removeClient(client);
  }

  @SubscribeMessage('message-from-client')
  handleMessageFromClient(client: Socket, payload: MessageDto) {
    console.log(client.id, payload)
  }
}
