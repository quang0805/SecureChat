import { motion } from "framer-motion";

const SecureBackground = () => {
    // Hoa văn mạch điện tử và lục giác (Data Circuit Pattern)
    const circuitPattern = `data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg stroke='%23a855f7' stroke-width='0.5' stroke-opacity='0.15'%3E%3Cpath d='M40 40l10-10 10 10-10 10zM10 10l10-10 10 10-10 10zM70 70l10-10 10 10-10 10zM10 70l10-10 10 10-10 10z' /%3E%3Cpath d='M40 40H20v20h20V40zM70 10H50v20h20V10z' opacity='0.5'/%3E%3Ccircle cx='40' cy='40' r='2' fill='%23a855f7' fill-opacity='0.2' /%3E%3Ccircle cx='10' cy='10' r='2' fill='%23a855f7' fill-opacity='0.2' /%3E%3Cpath d='M20 40L0 20M60 40l20-20M20 60L0 80M60 60l20 20' stroke-dasharray='2 2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E`;

    return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-[#fafafa] dark:bg-[#0b0b0e] transition-colors duration-500">

            {/* ================================================================================== */}
            {/*     LỚP HOA VĂN TRANG TRÍ MỚI (CYBER CIRCUIT PATTERN) */}
            {/* ================================================================================== */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div
                    className="absolute inset-0 opacity-60 dark:opacity-40 transition-opacity duration-500"
                    style={{
                        backgroundImage: `url("${circuitPattern}")`,
                        backgroundSize: '80px 80px', // Kích thước ô lặp lại
                        backgroundPosition: 'center center'
                    }}
                />

                {/* Hiệu ứng Vignette: Làm mờ hoa văn ở 4 góc để tập trung vào trung tâm */}
                <div className="absolute inset-0 bg-[radial-gradient(transparent_40%,#fafafa_100%)] dark:bg-[radial-gradient(transparent_40%,#0b0b0e_100%)] transition-colors duration-500" />
            </div>


            {/* ================================================================================== */}
            {/*     CÁC KHỐI SÁNG GRADIENT CHUYỂN ĐỘNG (AURORA EFFECT) - Giữ nguyên để tạo màu */}
            {/* ================================================================================== */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    x: [0, 100, 0],
                    y: [0, 50, 0],
                    rotate: [0, 20, 0] // Thêm chút xoay nhẹ
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                }}
                // Tăng độ blur và giảm opacity để hòa trộn tốt hơn với hoa văn
                className="absolute -top-[20%] -left-[20%] w-[60%] h-[60%] rounded-full bg-primary/20 blur-[150px] dark:bg-primary/15"
            />

            <motion.div
                animate={{
                    scale: [1, 1.3, 1],
                    x: [0, -80, 0],
                    y: [0, -100, 0],
                    rotate: [0, -20, 0]
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="absolute -bottom-[20%] -right-[20%] w-[70%] h-[70%] rounded-full bg-purple-500/20 blur-[180px] dark:bg-purple-500/15"
            />


            {/* ================================================================================== */}
            {/*                  HIỆU ỨNG DIGITAL PULSE (XUNG NHỊP RA-ĐA)*/}
            {/* ================================================================================== */}
            <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
                {[0, 1, 2].map((index) => (
                    <motion.div
                        key={index}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                            scale: [0.5, 2.5], // Phóng to từ giữa ra
                            opacity: [0.4, 0], // Mờ dần khi ra xa
                        }}
                        transition={{
                            duration: 6,
                            repeat: Infinity,
                            delay: index * 1.5, // Tạo độ trễ giữa các vòng sóng
                            ease: "easeOut",
                        }}
                        // Tạo vòng tròn với viền sáng màu primary
                        className="absolute border-[1px] border-primary/30 dark:border-primary/20 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.1)]"
                        style={{
                            width: '40vw', // Kích thước cơ sở
                            height: '40vw',
                        }}
                    />
                ))}
            </div>

            {/* 4. LỚP PHỦ NOISE - Giữ nguyên để tạo chất liệu */}
            <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>
    );
};

export default SecureBackground;