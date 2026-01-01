import { NextResponse } from "next/server"
import cloudinary from "@/lib/cloudinary-server"
import { auth } from "@/auth"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { data, folder } = await request.json()

    if (!data) {
      return NextResponse.json({ success: false, message: "No image data provided" }, { status: 400 })
    }

    // Upload to Cloudinary
    const uploadOptions: any = {
      resource_type: "image",
    }

    if (folder) {
      uploadOptions.folder = folder
    }

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(data, uploadOptions, (error, result) => {
        if (error) reject(error)
        else resolve(result)
      })
    })

    return NextResponse.json({
      success: true,
      url: (result as any).secure_url,
      publicId: (result as any).public_id,
    })
  } catch (error: any) {
    console.error("Error uploading image:", error)
    return NextResponse.json({ success: false, message: error.message || "Failed to upload image" }, { status: 500 })
  }
}
