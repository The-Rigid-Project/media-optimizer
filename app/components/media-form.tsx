"use client";

import { useState, ChangeEvent, useEffect } from "react";
import Image from "next/image";

interface MediaDimensions {
    width: number;
    height: number;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function MediaForm() {
    const [selectedFile, setSelectedFile] = useState<File | Blob | null>(null);
    const [mediaType, setMediaType] = useState<"image" | "video" | "gif" | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [dimensions, setDimensions] = useState<MediaDimensions | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);
        setIsProcessing(true);

        let processedFile: File | Blob = file;

        // Check for HEIC/HEIF support
        const isHeic = file.type === "image/heic" || file.type === "image/heif" || file.name.toLowerCase().endsWith(".heic");

        if (isHeic) {
            try {
                const heic2any = (await import("heic2any")).default;
                const converted = await heic2any({
                    blob: file,
                    toType: "image/jpeg",
                    quality: 0.8,
                });

                processedFile = Array.isArray(converted) ? converted[0] : converted;
            } catch (err) {
                setError("Failed to convert HEIC image. Please try a standard format.");
                setIsProcessing(false);
                return;
            }
        }

        if (processedFile.size > MAX_FILE_SIZE) {
            setError("File is too large. Maximum size is 5MB.");
            setIsProcessing(false);
            return;
        }

        const type = processedFile.type;

        if (type === "image/gif") {
            setMediaType("gif");
        } else if (type.startsWith("image/")) {
            setMediaType("image");
        } else if (type.startsWith("video/")) {
            setMediaType("video");
        }

        const url = URL.createObjectURL(processedFile);
        setPreviewUrl(url);
        setSelectedFile(processedFile);

        const img = new window.Image();
        img.onload = () => {
            setDimensions({
                width: img.naturalWidth,
                height: img.naturalHeight,
            });
            setIsProcessing(false);
        };
        img.src = url;
    };

    const uploadAndOptimize = async () => {
        if (!selectedFile || !dimensions || !mediaType) return;

        setIsProcessing(true);
        setError(null);

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("width", dimensions.width.toString());
        formData.append("height", dimensions.height.toString());

        try {
            const response = await fetch(`/api/optimize-${mediaType}`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error(`Optimization failed for ${mediaType}`);

            const optimizedBlob = await response.blob();

            // Cleanup and update preview with optimized version
            if (previewUrl) URL.revokeObjectURL(previewUrl);

            const optimizedUrl = URL.createObjectURL(optimizedBlob);

            console.log(optimizedUrl);

            setPreviewUrl(optimizedUrl);
            setSelectedFile(optimizedBlob);

        } catch (err) {
            setError("Failed to optimize media. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="bg-zinc-50 dark:bg-zinc-900 flex flex-col gap-4 p-6 max-w-xl w-full mx-auto">
            <div className="rounded-lg p-4 border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex flex-col gap-2">
                <label className="text-sm font-semibold">
                    Upload Media <span className="font-normal">(Images, GIFs)</span>
                </label>
                <input
                    type="file"
                    accept="image/*, .heic, .heif"
                    onChange={handleFileChange}
                    disabled={isProcessing}
                    className="file:mr-2 file:cursor-pointer hover:opacity-75 file:bg-black file:dark:bg-white file:dark:text-black file:py-2 file:px-4 rounded-lg file:text-white block w-full text-sm file:rounded-md file:border-0 file:text-sm file:font-semibold disabled:opacity-50"
                />
            </div>

            {isProcessing && (
                <div className="flex items-center gap-2 text-sm text-blue-600 animate-pulse font-medium">
                    <span>Processing media...</span>
                </div>
            )}

            {error && <p className="text-red-500 text-xs font-bold">{error}</p>}

            {previewUrl && dimensions && !isProcessing && (
                <div className="flex flex-col items-center animate-in fade-in duration-500 gap-4">
                    <div className="relative overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <Image
                            src={previewUrl}
                            alt="Media Preview"
                            width={dimensions.width}
                            height={dimensions.height}
                            unoptimized
                            className="object-contain"
                            style={{
                                maxHeight: "65vh",
                                width: "auto",
                                height: "auto",
                                display: "block",
                            }}
                        />
                    </div>

                    <div className="flex justify-between w-full text-[10px] tracking-widest text-zinc-500 font-bold uppercase">
                        <span>{dimensions.width}x{dimensions.height}</span>
                        {selectedFile && (
                            <span>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                        )}
                    </div>

                    <button
                        onClick={uploadAndOptimize}
                        className="cursor-pointer w-full py-3 bg-black dark:bg-white text-white dark:text-black font-bold rounded-lg text-sm hover:opacity-90 transition-opacity active:scale-[0.98]"
                    >
                        Optimize {mediaType === 'gif' ? 'GIF' : 'Image'}
                    </button>
                </div>
            )}
        </div>
    );
}