# app/core/websockets.py
import uuid
from collections import defaultdict
from fastapi import WebSocket
import json

class ConnectionManager:
    def __init__(self):
        # Lưu các kết nối theo User ID: {user_id: [socket1, socket2, ...]}
        self.active_connections: dict[uuid.UUID, list[WebSocket]] = defaultdict(list)

    # Hàm này được gọi khi mở kết nối socket.
    async def connect(self, websocket: WebSocket, user_id: uuid.UUID, username: str):
        await websocket.accept()
        self.active_connections[user_id].append(websocket)
        print(f"🟢 User connected: {username} ({user_id}). Active devices: {len(self.active_connections[user_id])}") 

        # Nếu đây là thiết bị đầu tiên của người này kết nối, thông báo trạng thái online
        if len(self.active_connections[user_id]) == 1:
            await self.broadcast_status_change(user_id, "online")

    # Hàm này được gọi khi đóng kết nối socket. 
    async def disconnect(self, websocket: WebSocket, user_id: uuid.UUID, username: str):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
                print(f"🔴 Device disconnected for: {username}. Remaining: {len(self.active_connections[user_id])}")
            
            # Nếu không còn thiết bị nào online, xóa hẳn User khỏi danh sách và báo offline
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
                await self.broadcast_status_change(user_id, "offline")
    
    # Broadcast message tới các user có id thuộc user_ids.
    async def broadcast(self, message: dict, user_ids: list[uuid.UUID]):
            message_json = json.dumps(message, default=str)
            print(">>> CALL from app.core.websockets.py/broadcast")
            for user_id in user_ids:
                if user_id in self.active_connections:
                    for connection in list(self.active_connections[user_id]):
                        try:
                            await connection.send_text(message_json)
                        except Exception as e:
                            print(f"Could not send message to user {user_id}: {e}")
                            await self.disconnect(connection, user_id)

    # Thông báo cho toàn hệ thống biết một user vừa online/offline. 
    async def broadcast_status_change(self, user_id: uuid.UUID, status: str):
        event = {
            "type" : "user_status_change",
            "payload" : {
                "user_id": str(user_id),
                "status" : status
            }
        }
        await self.broadcast_to_all(event)

    # Broadcast tới tất cả người dùng đang online. 
    async def broadcast_to_all(self, message: dict):
        message_json = json.dumps(message, default=str)
        for user_id, connections in list(self.active_connections.items()):
            for connection in list(connections):
                try:
                    await connection.send_text(message_json)
                except:
                    # Nếu lỗi, bỏ qua kết nối này
                    pass

manager = ConnectionManager()