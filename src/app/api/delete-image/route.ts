import { NextResponse } from "next/server"
import cloudinary from "@/lib/cloudinary-server"
import { auth } from "@/auth"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { publicId } = await request.json()

    if (!publicId) {
      return NextResponse.json({ success: false, message: "No public ID provided" }, { status: 400 })
    }

    // Delete from Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error: any, result: unknown) => {
        if (error) reject(error)
        else resolve(result)
      })
    })

    return NextResponse.json({
      success: true,
      result,
    })
  } catch (error: any) {
    console.error("Error deleting image:", error)
    return NextResponse.json({ success: false, message: error.message || "Failed to delete image" }, { status: 500 })
  }
}
