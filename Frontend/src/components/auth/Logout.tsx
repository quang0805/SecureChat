import { Button } from '../ui/button'
import { useNavigate } from 'react-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { toast } from 'sonner'
import { LogOut, LogOutIcon, LucideLogOut } from 'lucide-react'

const Logout = () => {
    const navigate = useNavigate()
    const logOut = useAuthStore((state) => state.logOut)
    const handleLogout = () => {
        logOut()
        toast.success("Đăng xuất thành công!")
        navigate("/signin")
    }

    return (
        <Button
            variant="completeGhost"
            onClick={handleLogout}
            className='cursor-pointer'
        >
            <LucideLogOut className='text-destructive' />
            Log out
        </Button>
    )
}

export default Logout
