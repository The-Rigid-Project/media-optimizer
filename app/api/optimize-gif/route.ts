import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

        const buffer = Buffer.from(await file.arrayBuffer());

        const optimizedBuffer = await sharp(buffer, {
            animated: true,
        })
            .resize({
                width: 800,
                withoutEnlargement: true,
                // Maintaining aspect ratio is handled automatically by sharp when only width is provided
            })
            .gif({
                // Reducing the color palette is still the most effective size saver
                colours: 128,
                // 'effort' ranges from 1 to 10. Higher = better compression but slower CPU time
                effort: 7,
                // Setting dither to a lower value can sometimes reduce size further
                dither: 1.0
            })
            .toBuffer();

        return new NextResponse(new Uint8Array(optimizedBuffer), {
            headers: {
                "Content-Type": "image/gif",
                "Content-Length": optimizedBuffer.length.toString(),
            },
        });
    } catch (error) {
        console.error("GIF Optimization Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}