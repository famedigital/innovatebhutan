import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dr9a371tx';
    const folder = 'innovatebhutan/slider';

    // Cloudinary Admin API for listing resources
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!apiKey || !apiSecret) {
      return NextResponse.json({
        success: false,
        error: 'Cloudinary credentials not configured',
        images: []
      });
    }

    // Cloudinary REST API to list resources in a folder
    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload?prefix=${folder}&max_results=50`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Basic ${auth}`
      }
    });

    if (!response.ok) {
      throw new Error(`Cloudinary API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Extract image names and create URLs
    const images = data.resources?.map((resource: any) => {
      const fileName = resource.public_id.split('/').pop();
      return {
        name: fileName,
        url: resource.secure_url,
        publicId: resource.public_id,
        createdAt: resource.created_at
      };
    }) || [];

    return NextResponse.json({
      success: true,
      folder,
      images,
      count: images.length
    });

  } catch (error) {
    console.error('Error scanning Cloudinary folder:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to scan folder',
      images: []
    }, { status: 500 });
  }
}