import { useState, useRef } from "react";
import { Camera, Loader2, Check, X, User as UserIcon, ZoomIn } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import { AnimatePresence, motion } from "framer-motion";

interface ProfileSettingsProps {
    onClose: () => void;
}

export const ProfileSettings = ({ onClose }: ProfileSettingsProps) => {
    const { user, updateDisplayName, updateAvatar } = useAuthStore();
    const [tempName, setTempName] = useState(user?.display_name || "");
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isZoomed, setIsZoomed] = useState(false);

    const avatarSrc = previewUrl || user?.avatar_url;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Ảnh không được vượt quá 5MB");
                return;
            }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        if (!tempName.trim()) {
            toast.error("Tên hiển thị không được để trống");
            return;
        }
        setLoading(true);
        try {
            if (selectedFile) {
                const finalAvatarUrl = await authService.uploadToCloudinary(selectedFile);
                if (finalAvatarUrl) await updateAvatar(finalAvatarUrl);
            }
            if (tempName !== user?.display_name) await updateDisplayName(tempName);
            toast.success("Profile updated successfully!");
            onClose();
        } catch (error) {
            toast.error("Có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-background relative">
            {/* 1. HEADER */}
            <div className="bg-gradient-to-r from-primary/10 via-transparent to-transparent p-6 pb-2">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-primary/20">
                        <UserIcon className="size-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight">Edit Profile</h2>
                </div>
            </div>

            <div className="p-6 space-y-8 flex-1">
                {/* 2. AVATAR SECTION - TO VÀ CĂN GIỮA */}
                <div className="flex flex-col items-center justify-center pt-4">
                    <div className="relative group">
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-primary/25 rounded-full blur-3xl group-hover:bg-primary/40 transition-all duration-700" />

                        {/* Avatar chính */}
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setIsZoomed(true)}
                            className="relative z-10 cursor-pointer"
                        >
                            <Avatar className="size-40 border-4 border-background shadow-2xl overflow-hidden transition-all duration-300 group-hover:border-primary/40">
                                <AvatarImage src={avatarSrc} className="object-cover w-full h-full" />
                                <AvatarFallback className="text-4xl font-black bg-gradient-to-br from-primary to-primary-glow text-white">
                                    {user?.display_name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                            {/* Hover Hint */}
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 rounded-full flex items-center justify-center transition-opacity">
                                <ZoomIn className="text-white size-6" />
                            </div>
                        </motion.div>

                        {/* Nút Camera */}
                        <button
                            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                            className="absolute bottom-2 right-2 z-30 p-3 bg-primary text-white rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all border-4 border-background cursor-pointer"
                        >
                            <Camera className="size-5" />
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    </div>

                    <div className="mt-4 text-center">
                        <p className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">Profile Identity</p>
                        <p className="text-[10px] text-muted-foreground italic">Nhấn vào ảnh để xem kích thước lớn</p>
                    </div>
                </div>

                {/* 3. INPUT SECTION */}
                <div className="space-y-2 max-w-[320px] mx-auto w-full">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Display Name</label>
                    <div className="relative group">
                        <Input
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            className="h-12 bg-muted/40 border-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-2xl px-4 text-center font-medium"
                        />
                        <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    </div>
                </div>
            </div>

            {/* 4. FOOTER */}
            <div className="p-6 pt-4 flex items-center justify-end gap-3 border-t border-border/40 bg-muted/5">
                <Button variant="ghost" onClick={onClose} className="rounded-xl font-semibold">Cancel</Button>
                <Button onClick={handleSave} disabled={loading} className="rounded-xl bg-primary px-8 shadow-lg font-bold active:scale-95">
                    {loading ? <Loader2 className="size-4 animate-spin" /> : <><Check className="size-4 mr-2" /> Save Changes</>}
                </Button>
            </div>

            {/* 5. SIÊU PHÓNG TO */}
            <AnimatePresence>
                {isZoomed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsZoomed(false)}
                        className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-12 cursor-zoom-out"
                    >
                        <motion.button
                            className="absolute top-8 right-8 p-1 rounded-full bg-muted transition-colors cursor-pointer"
                        >
                            <X className="size-6" />
                        </motion.button>

                        <motion.div
                            initial={{ scale: 0.5, y: 100 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-[600px] aspect-square rounded-[3rem] overflow-hidden border-8 border-background shadow-[0_0_80px_rgba(0,0,0,0.4)] bg-muted"
                        >
                            {avatarSrc ? (
                                <img src={avatarSrc} alt="Large Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-primary text-white text-[12rem] font-black">
                                    {user?.display_name?.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};