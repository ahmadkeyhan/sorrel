// Helper function to read file as base64
export const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }
  
  // Extract public_id from Cloudinary URL
  export const extractPublicIdFromUrl = (url: string): string | null => {
    try {
      // Example URL: https://res.cloudinary.com/demo/image/upload/v1234567890/cafe-menu/abcdef.jpg
      const regex = /\/v\d+\/(.+)\.\w+$/
      const match = url.match(regex)
      return match ? match[1] : null
    } catch (error) {
      console.error("Error extracting public ID:", error)
      return null
    }
  }
  
  // Upload image to Cloudinary via our API
  export const uploadImage = async (file: File): Promise<string> => {
    // Convert file to base64
    const base64data = await readFileAsBase64(file)
  
    // Upload to Cloudinary via our API
    const result = await fetch("/api/upload-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: base64data,
        folder: "cafe-menu",
      }),
    })
  
    if (!result.ok) {
      const error = await result.json()
      throw new Error(error.message || "Failed to upload image")
    }
  
    const data = await result.json()
    return data.url
  }
  
  // Delete image from Cloudinary via our API
  export const deleteImage = async (url: string): Promise<void> => {
    // Extract public_id from URL
    const publicId = extractPublicIdFromUrl(url)
  
    if (!publicId) return
  
    // Delete from Cloudinary via our API
    await fetch("/api/delete-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ publicId }),
    })
  }
  
  