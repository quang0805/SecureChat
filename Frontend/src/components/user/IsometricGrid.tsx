import React from 'react'
import { motion } from 'framer-motion'

export function IsometricGrid() {
    // Bảng màu mới: Chuyển từ Tím đậm sang Hồng Neon để khớp với thương hiệu SecureChat
    const waves = [
        {
            color: 'fill-primary',
            opacity: 0.15,
            y: 0,
            duration: 18,
            delay: 0,
            d: 'M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z',
        },
        {
            color: 'fill-purple-600',
            opacity: 0.2,
            y: 20,
            duration: 23,
            delay: 2,
            d: 'M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z',
        },
        {
            color: 'fill-fuchsia-500',
            opacity: 0.15,
            y: 40,
            duration: 20,
            delay: 1,
            d: 'M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,202.7C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z',
        },
        {
            color: 'fill-pink-500', // Sóng ngoài cùng rực rỡ nhất
            opacity: 0.25,
            y: 60,
            duration: 25,
            delay: 0,
            d: 'M0,96L48,122.7C96,149,192,203,288,208C384,213,480,171,576,144C672,117,768,107,864,128C960,149,1056,203,1152,213.3C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z',
        },
    ]

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {/* 1. Base Gradient Background: Sử dụng tông màu tối sâu (Midnight)*/}
            <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-primary/20 dark:from-background dark:via-[#0b0b0e] dark:to-primary/10" />

            {/* 2. Animated Wave Layers */}
            <div className="absolute bottom-0 left-0 right-0 h-full w-full flex items-end">
                <svg
                    className="w-full h-[60%] sm:h-full opacity-60 dark:opacity-40" // Giảm độ chói ở Dark Mode
                    viewBox="0 0 1440 320"
                    preserveAspectRatio="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {waves.map((wave, index) => (
                        <motion.path
                            key={index}
                            d={wave.d}
                            className={wave.color}
                            fillOpacity={wave.opacity}
                            initial={{
                                y: 50,
                                scaleY: 1.1,
                            }}
                            animate={{
                                y: [0, -20, 0],
                                scaleY: [1, 1.1, 1],
                                x: [0, 15, 0], // Giảm biên độ ngang cho mượt hơn
                            }}
                            transition={{
                                duration: wave.duration,
                                repeat: Infinity,
                                ease: 'easeInOut',
                                delay: wave.delay,
                                repeatType: 'mirror',
                            }}
                            style={{
                                originY: 1,
                            }}
                        />
                    ))}
                </svg>
            </div>

            {/* 3. Overlay gradient: Tạo hiệu ứng tan biến ở phía dưới cùng */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />
        </div>
    )
}