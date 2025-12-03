import { useChatStore } from '@/stores/useChatStore'
import React from 'react'
import DirectMessageCard from './DirectMessageCard';


const DirectMessageList = () => {
    const conversations = useChatStore((s) => s.conversations);
    if (!conversations) {
        return;
    }
    const directConversations = conversations.filter((conv) => conv.type === 'private')

    return (
        <div
            className='flex-1 overflow-y-auto p-2 space-y-2'
        >
            {
                directConversations.map((convo, index) => (
                    <DirectMessageCard
                        key={index}
                        convo={convo}
                    />
                ))
            }

        </div>
    )
}

export default DirectMessageList
