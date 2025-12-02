import { Button } from '../ui/button'
import { useNavigate } from 'react-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { toast } from 'sonner'

const Logout = () => {
    const navigate = useNavigate()
    const logOut = useAuthStore((state) => state.logOut)
    const handleLogout = () => {
        logOut()
        toast.success("Đăng xuất thành công!")
        navigate("/signin")
    }

    return (
        <div className='flex justify-center items-center h-screen'>
            <Button
                onClick={handleLogout}

            >LOGOUT</Button>
        </div>
    )
}

export default Logout
