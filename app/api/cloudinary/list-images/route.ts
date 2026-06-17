import { NextResponse } from "next/server";

interface CloudinaryResource {
  public_id: string;
  secure_url: string;
  resource_type: 'image' | 'video';
  format: string;
  created_at: string;
  width?: number;
  height?: number;
  duration?: number;
}

interface CloudinaryResponse {
  resources: CloudinaryResource[];
  next_cursor?: string;
  total_count: number;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || 'innovate_bhutan';
    const includeVideos = searchParams.get('includeVideos') === 'true';

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dr9a371tx';

    // Cloudinary Admin API credentials
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!apiKey || !apiSecret) {
      return NextResponse.json({
        success: false,
        error: 'Cloudinary credentials not configured',
        media: []
      });
    }

    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
    const allMedia: any[] = [];
    let nextCursor: string | undefined;

    // Fetch all resources with pagination
    do {
      // Fetch images
      const imageUrl = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload?prefix=${folder}&max_results=500${nextCursor ? `&next_cursor=${nextCursor}` : ''}`;
      const imageResponse = await fetch(imageUrl, {
        headers: { 'Authorization': `Basic ${auth}` }
      });

      if (imageResponse.ok) {
        const imageData: CloudinaryResponse = await imageResponse.json();
        allMedia.push(...imageData.resources);
        nextCursor = imageData.next_cursor;
      } else {
        console.error('Cloudinary image API error:', imageResponse.statusText);
      }
    } while (nextCursor);

    // Fetch videos if requested
    if (includeVideos) {
      nextCursor = undefined;
      do {
        const videoUrl = `https://api.cloudinary.com/v1_1/${cloudName}/resources/video/upload?prefix=${folder}&max_results=500${nextCursor ? `&next_cursor=${nextCursor}` : ''}`;
        const videoResponse = await fetch(videoUrl, {
          headers: { 'Authorization': `Basic ${auth}` }
        });

        if (videoResponse.ok) {
          const videoData: CloudinaryResponse = await videoResponse.json();
          allMedia.push(...videoData.resources);
          nextCursor = videoData.next_cursor;
        } else {
          console.error('Cloudinary video API error:', videoResponse.statusText);
          break;
        }
      } while (nextCursor);
    }

    // Transform resources into media items
    const media = allMedia.map((resource: CloudinaryResource) => {
      const parts = resource.public_id.split('/');
      const fileName = parts.pop();
      const subfolder = parts[parts.length - 1] || 'root';

      return {
        publicId: resource.public_id,
        name: fileName,
        url: resource.secure_url,
        type: resource.resource_type, // 'image' or 'video'
        format: resource.format,
        subfolder,
        createdAt: resource.created_at,
        width: resource.width,
        height: resource.height,
        duration: resource.duration
      };
    });

    // Sort by created date (newest first)
    media.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Group by subfolder
    const bySubfolder = media.reduce((acc: any, item) => {
      if (!acc[item.subfolder]) acc[item.subfolder] = [];
      acc[item.subfolder].push(item);
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      folder,
      media,
      count: media.length,
      bySubfolder,
      imageCount: media.filter((m: any) => m.type === 'image').length,
      videoCount: media.filter((m: any) => m.type === 'video').length
    });

  } catch (error) {
    console.error('Error scanning Cloudinary:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to scan Cloudinary',
      media: []
    }, { status: 500 });
  }
}