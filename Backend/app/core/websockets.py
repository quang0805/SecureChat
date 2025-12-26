# app/core/websockets.py
import uuid
from collections import defaultdict
from fastapi import WebSocket
import json

class ConnectionManager:
    def __init__(self):
        # Lưu các kết nối theo User ID: {user_id: [socket1, socket2, ...]}
        # Việc dùng list giúp một người dùng có thể online trên cả điện thoại và máy tính cùng lúc.
        self.active_connections: dict[uuid.UUID, list[WebSocket]] = defaultdict(list)

    async def connect(self, websocket: WebSocket, user_id: uuid.UUID, username: str):
        await websocket.accept()
        self.active_connections[user_id].append(websocket)
        print(f"🟢 User connected: {username} ({user_id}). Active devices: {len(self.active_connections[user_id])}") 

        # Nếu đây là thiết bị đầu tiên của người này kết nối, thông báo trạng thái online
        if len(self.active_connections[user_id]) == 1:
            await self.broadcast_status_change(user_id, "online")

    async def disconnect(self, websocket: WebSocket, user_id: uuid.UUID, username: str):
        """Xử lý khi một kết nối socket bị ngắt"""
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
                print(f"🔴 Device disconnected for: {username}. Remaining: {len(self.active_connections[user_id])}")
            
            # Nếu không còn thiết bị nào online, xóa hẳn User khỏi danh sách và báo offline
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
                await self.broadcast_status_change(user_id, "offline")

    async def broadcast(self, message: dict, user_ids: list[uuid.UUID]):
            message_json = json.dumps(message, default=str)
            print(message_json)
            for user_id in user_ids:
                if user_id in self.active_connections:
                    for connection in self.active_connections[user_id]:
                        try:
                            await connection.send_text(message_json)
                            print("Broadcast from broadcast function!")
                        except Exception as e:
                            print(f"Could not send message to user {user_id}: {e}")

    async def broadcast_status_change(self, user_id: uuid.UUID, status: str):
        """Thông báo cho toàn bộ hệ thống biết một User vừa online/offline"""
        event = {
            "type" : "user_status_change",
            "payload" : {
                "user_id": str(user_id),
                "status" : status
            }
        }
        await self.broadcast_to_all(event)

    async def broadcast_to_all(self, message: dict):
        """Gửi dữ liệu tới TẤT CẢ mọi người đang online trên toàn server"""
        message_json = json.dumps(message, default=str)
        for user_id, connections in self.active_connections.items():
            for connection in connections:
                try:
                    await connection.send_text(message_json)
                except:
                    # Nếu lỗi, bỏ qua kết nối này
                    pass

manager = ConnectionManager()