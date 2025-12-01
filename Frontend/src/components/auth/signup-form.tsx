import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@radix-ui/react-label"
import { z } from 'zod';
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'


const signUpSchema = z.object({
  firstname: z.string().min(1, "*"),
  lastname: z.string().min(1, "*"),
  username: z.string().min(3, "Tên đăng nhập phải có ít nhất 3 kí tự"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 kí tự")

});

type SingUpFormValues = z.infer<typeof signUpSchema>


export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SingUpFormValues>({
    resolver: zodResolver(signUpSchema)
  });

  const onSubmit = async (data: SingUpFormValues) => {
    // CALL API
    console.log(data)
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
                  Tạo tài khoản
                </h1>
                <p className="text-shadow-muted-foreground text-balance">
                  Chào mừng bạn đến với SecureChat!
                </p>
              </div>
              {/** họ & tên*/}
              <div className="grid grid-cols-2 gap-3">

                <div className="space-y-2">
                  <Label htmlFor="lastname" className="block text-sm">
                    Họ
                  </Label>
                  <Input
                    type="text"
                    id="lastname"
                    {...register("lastname")}
                  />
                  {
                    errors.lastname && (
                      <p className="text-destructive text-sm">
                        {errors.lastname.message}
                      </p>
                    )
                  }
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firstname" className="block text-sm">
                    Tên
                  </Label>
                  <Input
                    type="text"
                    id="firstname"
                    {...register("firstname")}

                  />
                  {
                    errors.firstname && (
                      <p className="text-destructive text-sm">
                        {errors.firstname.message}
                      </p>
                    )
                  }
                </div>
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
                Tạo tài khoản
              </Button>

              <div className="text-center text-sm">
                Đã có tài khoản? {" "}
                <a
                  href="/signin"
                  className="underline underline-offset-4 text-purple-400"
                >
                  Đăng nhập
                </a>
              </div>

            </div>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="/signup.svg"
              alt="Image"
              className="absolute top-1/2 -translate-y-1/2 object-cover"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
