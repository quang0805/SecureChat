import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@radix-ui/react-label"
import { z } from 'zod';
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from "react-router"
import { useAuthStore } from "@/stores/useAuthStore"
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import loginAnimation from "@/assets/animations/Login.json";

const signInSchema = z.object({
    username: z.string().min(3, "Tên đăng nhập phải có ít nhất 3 kí tự"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 kí tự")

});

type SignInFormValues = z.infer<typeof signInSchema>


export function SignInForm({
    className,
    ...props
}: React.ComponentProps<"div">) {

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignInFormValues>({
        resolver: zodResolver(signInSchema)
    });
    const signIn = useAuthStore((state) => state.signIn)
    const navigate = useNavigate()

    const onSubmit = async (data: SignInFormValues) => {
        const { username, password } = data
        try {
            await signIn(username, password)
            navigate("/")
        } catch (error) {
            // console.error(error.response.data.detail)
        }
    }
    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="overflow-hidden p-0 border-border ">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
                        <div className="flex flex-col gap-6">
                            {/** header - logo*/}
                            <div className="flex flex-col items-center text-center gap-2 ">
                                <a href="/" className="mx-auto block w-1/4 h-1/4 text-center">
                                    <img src="/logo_securechat.svg" alt="logo" />
                                </a>
                                <h1 className="text-2xl font-bold"
                                >
                                    Đăng nhập
                                </h1>
                                <p className="text-shadow-muted-foreground text-balance">
                                    Chào mừng bạn đã trở lại với SecureChat!
                                </p>
                            </div>
                            {/** username*/}
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="username" className="block text-sm">
                                    Tên đăng nhập
                                </Label>
                                <Input
                                    type="text"
                                    id="username"
                                    placeholder="username"
                                    {...register("username")}

                                />
                                {
                                    errors.username && (
                                        <p className="text-destructive text-sm">
                                            {errors.username.message}
                                        </p>
                                    )
                                }
                            </div>
                            {/** password*/}
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="password" className="block text-sm">
                                    Mật khẩu
                                </Label>
                                <Input
                                    type="password"
                                    id="password"
                                    {...register("password")}
                                />
                                {
                                    errors.password && (
                                        <p className="text-destructive text-sm">
                                            {errors.password.message}
                                        </p>
                                    )
                                }
                            </div>
                            {/** Nút đăng ký*/}
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isSubmitting}
                            >
                                Đăng Nhập
                            </Button>

                            <div className="text-center text-sm">
                                Chưa có tài khoản? {" "}
                                <a
                                    href="/signup"
                                    className="underline underline-offset-4 text-purple-400"
                                >
                                    Đăng ký
                                </a>
                            </div>

                        </div>
                    </form>

                    <div className="bg-muted relative hidden md:block overflow-hidden border-l border-border/50">
                        {/* Lớp nền Gradient mờ tạo chiều sâu */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5" />

                        {/* Các vòng tròn ánh sáng trang trí (Glow effect) */}
                        <div className="absolute top-1/4 -right-20 size-80 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
                        <div className="absolute bottom-1/4 -left-20 size-80 bg-purple-500/10 rounded-full blur-[100px]" />

                        {/* CONTAINER LOTTIE */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="absolute inset-0 flex items-center justify-center p-12"
                        >
                            <div className="relative w-full max-w-[450px]">
                                <Lottie
                                    animationData={loginAnimation}
                                    loop={true}
                                    style={{ width: '100%', height: '100%' }}
                                />

                                {/* Chú thích nhỏ tinh tế phía dưới animation */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 0.6, y: 0 }}
                                    transition={{ delay: 0.8 }}
                                    className="text-center mt-4"
                                >
                                    <p className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground">
                                        End-to-End Encrypted System
                                    </p>
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* Hiệu ứng Scanning Line (Đồng bộ với Welcome Screen) */}
                        {/* <motion.div
                            animate={{ top: ["0%", "100%", "0%"] }}
                            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                            className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent z-10"
                        /> */}
                    </div>

                </CardContent>
            </Card>
        </div>
    )
}
