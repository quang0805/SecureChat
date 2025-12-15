# app/core/websockets.py
import uuid
from collections import defaultdict
from fastapi import WebSocket
import json

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[uuid.UUID, list[WebSocket]] = defaultdict(list)

    async def connect(self, websocket: WebSocket, user_id: uuid.UUID, username: str):
        await websocket.accept()
        self.active_connections[user_id].append(websocket)
        print(f"User: {username} with ID: {user_id} connected.\nTotal connections for user: {len(self.active_connections[user_id])}") 

        if (len(self.active_connections[user_id]) == 1):
            await self.broadcast_status_change(user_id, "online")
        

    def disconnect(self, websocket: WebSocket, user_id: uuid.UUID, username: str):
        if websocket in self.active_connections[user_id]:
            self.active_connections[user_id].remove(websocket)
            print(f"User {username} disconnected. Remaining connections: {len(self.active_connections[user_id])}")
        if not self.active_connections[user_id]:
            del self.active_connections[user_id]
            pass

    async def broadcast(self, message: dict, user_ids: list[uuid.UUID]):
        message_json = json.dumps(message, default=str)
        for user_id in user_ids:
            if user_id in self.active_connections:
                for connection in self.active_connections[user_id]:
                    try:
                        await connection.send_text(message_json)
                        print("Broadcast from broadcast function!")
                    except Exception as e:
                        print(f"Could not send message to user {user_id}: {e}")

    async def broadcast_status_change(self, user_id: uuid.UUID, status: str):
        event = {
            "type" : "user_status_change",
            "payload" : {
                "user_id": str(user_id),
                "status" : status
            }
        }
        await self.broadcast_to_all(event)

    async def broadcast_to_all(self, message: dict):
        message_json = json.dumps(message)
        for user_id, connections in self.active_connections.items():
            for connection in connections:
                try:
                    await connection.send_text(message_json)
                except:
                    pass

                        
manager = ConnectionManager()