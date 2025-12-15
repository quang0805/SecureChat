# app/core/websockets.py
import uuid
from collections import defaultdict
from fastapi import WebSocket
import json

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[uuid.UUID, list[WebSocket]] = defaultdict(list)

    async def connect(self, websocket: WebSocket, user_id: uuid.UUID):
        await websocket.accept()
        self.active_connections[user_id].append(websocket)
        print(f"User {user_id} connected. Total connections for user: {len(self.active_connections[user_id])}") 

    def disconnect(self, websocket: WebSocket, user_id: uuid.UUID):
        if websocket in self.active_connections[user_id]:
            self.active_connections[user_id].remove(websocket)
            print(f"User {user_id} disconnected. Remaining connections: {len(self.active_connections[user_id])}")
        if not self.active_connections[user_id]:
            del self.active_connections[user_id]

    async def broadcast(self, message: dict, user_ids: list[uuid.UUID]):
        message_json = json.dumps(message, default=str)
        for user_id in user_ids:
            if user_id in self.active_connections:
                for connection in self.active_connections[user_id]:
                    try:
                        await connection.send_text(message_json)
                    except Exception as e:
                        print(f"Could not send message to user {user_id}: {e}")
                        
manager = ConnectionManager()