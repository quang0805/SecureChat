import Logout from '@/components/auth/Logout'
import { useAuthStore } from '@/stores/useAuthStore'

const ChatAppPage = () => {
    const user = useAuthStore((state) => state.user)
    return (
        <div>
            {`${user ? user.username : ''} ${user ? user.display_name : ''}`}
            <Logout />
        </div>
    )
}

export default ChatAppPage
