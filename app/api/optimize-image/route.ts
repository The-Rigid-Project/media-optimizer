import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const width = parseInt(formData.get("width") as string);

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Convert File to Buffer for Sharp
        const buffer = Buffer.from(await file.arrayBuffer());

        // Optimization Logic
        let pipeline = sharp(buffer)
            .rotate() // Auto-rotate based on EXIF data
            .webp({ quality: 80 }); // Convert to WebP with 80% quality

        // If the image is huge, let's cap it at 1200px wide for the "optimized" version
        if (width > 1200) {
            pipeline = pipeline.resize(1200);
        }

        // Convert the Node.js Buffer to a Uint8Array
        const optimizedBuffer = await pipeline.toBuffer();

        return new NextResponse(new Uint8Array(optimizedBuffer), {
            headers: {
                "Content-Type": "image/webp",
                "Content-Disposition": `attachment; filename="optimized.webp"`,
            },
        });
    } catch (error) {
        console.error("Optimization Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}