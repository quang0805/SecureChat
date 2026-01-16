import { SignupForm } from "@/components/auth/signup-form"
import SecureBackground from "@/components/user/SecureBackground"

const SignUpPage = () => {
    return (
        <div>
            <SecureBackground />
            <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10 absolute inset-0 z-0">
                <div className="w-full max-w-sm md:max-w-4xl">
                    <SignupForm />
                </div>
            </div>
        </div>
    )
}

export default SignUpPage
