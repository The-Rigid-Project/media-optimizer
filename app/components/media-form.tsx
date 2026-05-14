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

                // heic2any can return an array if multiple images are in the HEIC
                processedFile = Array.isArray(converted) ? converted[0] : converted;
            } catch (err) {
                setError("Failed to convert HEIC image. Please try a standard format.");
                setIsProcessing(false);
                return;
            }
        }

        // Final Validation on the (potentially converted) file
        if (processedFile.size > MAX_FILE_SIZE) {
            setError("File is too large. Maximum size is 5MB.");
            setIsProcessing(false);
            return;
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
                <div className="flex items-center gap-2 text-sm text-blue-600 animate-pulse">
                    <span>Processing media...</span>
                </div>
            )}

            {error && <p className="text-red-500 text-xs font-bold">{error}</p>}

            {previewUrl && dimensions && !isProcessing && (
                <div className="flex flex-col items-center animate-in fade-in duration-500">
                    <div className="relative overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <Image
                            src={previewUrl}
                            alt="Media Preview"
                            // We pass the intrinsic dimensions for the aspect ratio calculation
                            width={dimensions.width}
                            height={dimensions.height}
                            // Using unoptimized since we are showing a local blob URL
                            unoptimized
                            className="object-contain"
                            style={{
                                maxHeight: "65vh",
                                width: "auto", // Allows width to scale relative to height
                                height: "auto", // Allows height to shrink if it's naturally < 300px
                                display: "block",
                            }}
                        />
                    </div>
                    <div className="mt-3 flex justify-between w-full text-[10px] tracking-widest text-zinc-500 font-bold">
                        <span>
                            {dimensions.width}x{dimensions.height}
                        </span>
                        {selectedFile && (
                            <span>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}