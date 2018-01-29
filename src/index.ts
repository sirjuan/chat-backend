import * as WebSocket from "ws";

const wss = new WebSocket.Server({ port: process.env.PORT || 8989 });

console.log(process.env.PORT);

export interface IUser {
  name: string;
  id: number;
}

const users: IUser[] = [];

const broadcast = (data: any, ws: any) => {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN && client !== ws) {
      console.log(client);
      client.send(JSON.stringify(data));
    }
  });
};

wss.on("connection", (ws) => {
  let index: number;
  ws.on("message", (message: string) => {
    const data: any = JSON.parse(message);
    console.log('type', data.type);
    switch (data.type) {
      case "ADD_USER": {
        index = users.length;
        const user: IUser = { name: data.name, id: index + 1 }
        console.log(user)
        users.push(user);
        ws.send(JSON.stringify({
          type: "USERS_LIST",
          users
        }));
        broadcast({
          type: "USERS_LIST",
          users
        }, ws);
        break;
      }
      case "ADD_MESSAGE":
        broadcast({
          type: "ADD_MESSAGE",
          message: data.message,
          author: data.author
        }, ws);
        break;
      default:
        break;
    }
  });

  ws.on("close", () => {
    users.splice(index, 1);
    broadcast({
      type: "USERS_LIST",
      users
    }, ws);
  });
});
