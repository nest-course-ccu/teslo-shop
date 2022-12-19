import { JwtService } from '@nestjs/jwt';
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
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@WebSocketGateway({
  cors: true,
  //namespace: '9789',
})
export class MessagesWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() websocketServer: Server;

  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.headers.authentication as string;
    try {
      let payload: JwtPayload = this.jwtService.verify(token);
      console.log(`Connected ${client.id}`);
      await this.messagesWsService.registerClient(client, payload.id  );
      this.websocketServer.emit(
        'clients-updated',
        this.messagesWsService.getConnectionClients(),
      );
    } catch (error) {
      client.disconnect();
    }
  }
  handleDisconnect(client: Socket) {
    console.log(`Disconnected ${client.id}`);
    this.messagesWsService.removeClient(client);
  }

  @SubscribeMessage('message-from-client')
  handleMessageFromClient(client: Socket, payload: MessageDto) {
    console.log(client.id, payload);
    // emit to specific client
    //client.emit('messages-from-server', { fullName: 'Me', message: payload.message });

    // emit to all clients except client
    /*client.broadcast.emit('messages-from-server', {
      fullName: this.messagesWsService.getUserFullnameBySocketId(client.id),
      message: payload.message,
    });*/

    // emit to all clients
    this.websocketServer.emit('messages-from-server', 
    { 
      fullName: this.messagesWsService.getUserFullnameBySocketId(client.id),
      message: payload.message 
    });
  }
}
