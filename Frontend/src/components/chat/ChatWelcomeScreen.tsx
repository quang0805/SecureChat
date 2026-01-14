import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

const ChatWelcomeScreen = () => {
    return (
        <div className="bg-background w-full h-full rounded-2xl flex flex-col justify-center items-center relative overflow-hidden border border-border/40 shadow-2xl">

            {/* 1. Background Decor: Các vòng tròn mờ tạo chiều sâu */}
            <div className="absolute inset-0 pointer-events-none">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px]"
                />
            </div>

            {/*Central Animated Logo */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 flex flex-col items-center"
            >
                {/* Vòng xoay bao quanh icon */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -inset-8 border-2 border-dashed border-primary/30 rounded-full"
                />
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute -inset-14 border border-dotted border-primary/20 rounded-full"
                />

                {/* Icon chính với hiệu ứng Floating */}
                <motion.div
                    animate={{ y: [0, -12, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="bg-primary/10 p-6 rounded-[2rem] border border-primary/20 backdrop-blur-xl"
                >
                    <ShieldCheck size={56} className="text-primary" />
                </motion.div>
            </motion.div>

            {/* Text & Branding: Tối giản tối đa */}
            <div className="mt-12 text-center z-10">
                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-2xl font-bold tracking-[0.2em] uppercase text-foreground/90"
                >
                    Secure<span className="text-primary">Chat</span>
                </motion.h1>

                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "40px" }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="h-[2px] bg-primary mx-auto mt-4 mb-4"
                />

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    transition={{ delay: 1.2 }}
                    className="text-[10px] uppercase tracking-[0.3em] font-medium"
                >
                    End-to-End Encrypted
                </motion.p>
            </div>

            {/* Tín hiệu quét (Scanning line) */}
            <motion.div
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-[1px] bg-linear-to-r from-transparent via-primary/20 to-transparent z-0"
            />
        </div>
    );
};

export default ChatWelcomeScreen;