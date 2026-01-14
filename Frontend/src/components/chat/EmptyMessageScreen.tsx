import Lottie from "lottie-react";
import { motion } from "framer-motion";
import securityAnimation from "@/assets/animations/RobotChat.json";
import { useChatStore } from "@/stores/useChatStore";

const EmptyMessageScreen = () => {
    const { activeConversationId, sendMessage } = useChatStore();
    const sendHelloMessage = async () => {
        sendMessage(activeConversationId!, "Xin chào!");
    }
    return (
        <div className="bg-chat-pattern flex h-full w-full justify-center items-center overflow-hidden">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                className="flex flex-col items-center p-10 rounded-[3rem] bg-background/40 backdrop-blur-xl border border-white/10 shadow-2xl max-w-sm text-center mx-4"
            >
                {/* LOTTIE ANIMATION CONTAINER */}
                <div className="w-64 h-64 mb-4 relative">
                    {/* Hào quang nền */}
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-[50px] animate-pulse" />

                    <Lottie
                        animationData={securityAnimation}
                        loop={true}
                        className="relative z-10"
                    />
                </div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <h3 className="text-xl font-black text-foreground mb-3">
                        Welcome!
                    </h3>
                    <p className="text-sm text-muted-foreground px-4 leading-relaxed">
                        Bắt đầu gửi tin nhắn được mã hóa ngay bây giờ.
                    </p>
                </motion.div>

                <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(168, 85, 247, 0.4)" }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-8 px-8 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-2xl shadow-lg transition-all cursor-pointer"
                    onClick={sendHelloMessage}
                >
                    Gửi lời chào 👋
                </motion.button>
            </motion.div>
        </div>
    );
};

export default EmptyMessageScreen;