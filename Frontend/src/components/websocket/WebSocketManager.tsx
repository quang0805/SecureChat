// WebSocketManager.tsx
import { useAuthStore } from '@/stores/useAuthStore';
import { useChatStore } from '@/stores/useChatStore';
import { useEffect } from 'react';
import useWebSocket from 'react-use-websocket';


const WebSocketManager = () => {
    const { accessToken } = useAuthStore();
    const { handleIncomingMessage, handleUserStatusChange, handleIncomingNewConversation } = useChatStore();

    const socketUrl = accessToken ? `wss://192.168.111.113:8000/ws/${accessToken}` : null;

    const { lastMessage } = useWebSocket(socketUrl, {
        // Tự động kết nối lại
        shouldReconnect: (closeEvent) => true,
        reconnectAttempts: 10,
        reconnectInterval: 3000,
        share: true, // Cho phép nhiều component dùng chung socket.

        onOpen: () => console.log('🟢 WS Connected!!!'),
        onClose: () => console.log('🔴 WS Disconnected!!!'),
    });

    // Lắng nghe tin nhắn
    useEffect(() => {
        if (lastMessage !== null) {
            try {
                const data = JSON.parse(lastMessage.data);

                if (data.type === 'new_message' && data.payload) {
                    handleIncomingMessage(data.payload);
                } else if (data.type === "user_status_change" && data.payload) {
                    const { user_id, status } = data.payload;
                    handleUserStatusChange(user_id, status);
                } else if (data.type === "new_conversation" && data.payload) {
                    console.log(`Conversation create: ${data.payload.type}`)
                    handleIncomingNewConversation(data.payload);
                }
            } catch (err) {
                console.error("Lỗi parse tin nhắn:", err);
            }
        }
    }, [lastMessage, handleIncomingMessage]);
    return null;
};

export default WebSocketManager;