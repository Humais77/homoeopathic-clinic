import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/src/lib/auth";
import cloudinary from "@/src/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const formData = await request.formData();

    const file = formData.get("file");
    const folder =
      formData.get("folder")?.toString() ||
      "heal-by-nature/general";

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "Image file is required",
        },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        {
          success: false,
          message: "Only image files are allowed",
        },
        { status: 400 }
      );
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          message: "Image must be smaller than 5MB",
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();

    const buffer = Buffer.from(arrayBuffer);

    const result = await new Promise<any>(
      (resolve, reject) => {
        const uploadStream =
          cloudinary.uploader.upload_stream(
            {
              folder,
              resource_type: "image",
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          );

        uploadStream.end(buffer);
      }
    );

    return NextResponse.json({
      success: true,
      image: result.secure_url,
      imagePublicId: result.public_id,
    });
  } catch (error) {
    console.error("Admin media upload error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to upload image",
      },
      { status: 500 }
    );
  }
}