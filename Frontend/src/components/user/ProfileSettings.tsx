import { useState, useRef } from "react";
import { Camera, Loader2, Check, X, User as UserIcon } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

interface ProfileSettingsProps {
    onClose: () => void;
}

export const ProfileSettings = ({ onClose }: ProfileSettingsProps) => {
    const { user, updateDisplayName } = useAuthStore();

    const [tempName, setTempName] = useState(user?.display_name || "");
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Xử lý khi chọn ảnh mới
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error("Ảnh không được vượt quá 2MB");
                return;
            }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    // Hàm lưu tổng thể
    const handleSave = async () => {
        setLoading(true);
        try {
            // 1. Nếu có ảnh mới -> Upload ảnh (Giả sử bạn đã có api này trong authService)
            if (selectedFile) {
                const formData = new FormData();
                formData.append("file", selectedFile);
                // await authService.uploadAvatar(formData); 
                // Sau khi upload thành công, logic backend nên cập nhật user.avatar_url
            }

            // 2. Cập nhật Display Name
            if (tempName !== user?.display_name) {
                await updateDisplayName(tempName);
            }

            toast.success("Hồ sơ đã được cập nhật!");
            onClose();
        } catch (error) {
            toast.error("Có lỗi xảy ra khi cập nhật");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="bg-gradient-to-r from-primary/10 via-transparent to-transparent p-6 pb-2">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-primary/20">
                        <UserIcon className="size-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight">Edit Profile</h2>
                </div>
            </div>

            <div className="p-6 space-y-8">
                {/* AVATAR SECTION */}
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-all duration-500" />

                        <Avatar className="size-4/5 border-4 border-background shadow-2xl relative z-10 cursor-pointer"
                        >
                            <AvatarImage src={previewUrl || user?.avatar_url} className="object-cover" />
                            <AvatarFallback className="text-2xl font-bold bg-primary text-white">
                                {user?.display_name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-0 right-0 z-20 p-2 bg-primary text-white rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all"
                        >
                            <Camera className="size-5 cursor-pointer" />
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">
                        Nhấn vào icon để đổi ảnh đại diện
                    </p>
                </div>

                {/* NAME INPUT SECTION */}
                <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                        Display Name
                    </label>
                    <div className="relative group">
                        <Input
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            placeholder="Nhập tên mới..."
                            className="h-12 bg-muted/40 border-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-xl px-4 transition-all"
                        />
                        <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    </div>
                </div>
            </div >

            <div className="p-6 pt-2 flex items-center justify-end gap-3">
                <Button
                    variant="ghost"
                    onClick={onClose}
                    className="rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
                >
                    <X className="mr-2 size-4" /> Cancel
                </Button>
                <Button
                    onClick={handleSave}
                    disabled={loading}
                    className="rounded-xl bg-primary px-6 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all cursor-pointer"
                >
                    {loading ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : (
                        <Check className="mr-2 size-4" />
                    )}
                    Save Changes
                </Button>
            </div>
        </>
    );
};