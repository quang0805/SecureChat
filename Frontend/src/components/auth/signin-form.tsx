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
            <Card className="overflow-hidden p-0 border-border">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
                        <div className="flex flex-col gap-6">
                            {/** header - logo*/}
                            <div className="flex flex-col items-center text-center gap-2">
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
                    <div className="bg-muted relative hidden md:block">
                        <img
                            src="/signin.svg"
                            alt="Image"
                            className="absolute top-1/2 -translate-y-1/2 object-cover"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
