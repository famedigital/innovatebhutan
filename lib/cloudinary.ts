/**
 * 🛰️ CLOUDINARY MEDIA ARCHITECT
 * Pure Client-Side Utility (Safe for Browser)
 */

/**
 * Get optimized media URL from Cloudinary
 * @param publicId - Cloudinary public ID
 * @param isVideo - Whether this is a video
 * @param isHardware - Whether this is hardware product photo
 */
export const getMediaUrl = (publicId: string, isVideo = false, isHardware = false) => {
  const resourceType = isVideo ? 'video' : 'image';
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dr9a371tx';

  const transformations = [
    'f_auto',   // Auto format: AVIF/WebP
    'q_auto',   // AI quality compression
  ];

  if (isVideo) {
    transformations.push('br_auto'); // Adaptive bitrate
    transformations.push('vc_auto'); // Auto video codec
  } else {
    transformations.push('fl_progressive'); // Progressive image loading
    transformations.push('w_1200');          // Cap width
  }

  if (isHardware) {
    transformations.push('e_sharpen:80');
  }

  const transformString = transformations.join(',');
  const baseUrl = `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/${transformString}/${publicId}`;

  return isVideo ? `${baseUrl}.mp4` : baseUrl;
};

/**
 * Get optimized video URL from Cloudinary
 * @param publicId - Cloudinary public ID for the video
 * @param options - Video optimization options
 */
export const getVideoUrl = (
  publicId: string,
  options: {
    quality?: 'auto' | 'low' | 'medium' | 'high';
    format?: 'mp4' | 'webm' | 'auto';
    bitrate?: 'auto' | number;
    codec?: 'auto' | 'h264' | 'vp9' | 'av1';
    width?: number;
    maxWidth?: number;
  } = {}
) => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dr9a371tx';
  const {
    quality = 'auto',
    format = 'mp4',
    bitrate = 'auto',
    codec = 'auto',
    width,
    maxWidth = 1920
  } = options;

  const transformations: string[] = [];

  // Quality
  transformations.push(`q_${quality}`);

  // Bitrate
  if (bitrate === 'auto') {
    transformations.push('br_auto');
  } else {
    transformations.push(`br_${bitrate}k`);
  }

  // Codec
  if (codec === 'auto') {
    transformations.push('vc_auto');
  } else {
    transformations.push(`vc_${codec}`);
  }

  // Width
  if (width) {
    transformations.push(`w_${width}`);
  } else {
    transformations.push(`w_${maxWidth}`);
  }

  // Auto format
  if (format === 'auto') {
    transformations.push('f_auto');
  }

  const transformString = transformations.join(',');
  const baseUrl = `https://res.cloudinary.com/${cloudName}/video/upload/${transformString}/${publicId}`;

  return `${baseUrl}.${format === 'auto' ? 'mp4' : format}`;
};

/**
 * Get video poster/thumbnail URL
 * @param publicId - Cloudinary public ID for the video
 * @param options - Image optimization options
 */
export const getVideoPosterUrl = (
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: 'auto' | 'low' | 'medium' | 'high';
    format?: 'jpg' | 'webp' | 'auto';
    gravity?: 'auto' | 'center' | 'north' | 'south' | 'east' | 'west';
  } = {}
) => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dr9a371tx';
  const {
    width = 1920,
    height = 1080,
    quality = 'auto',
    format = 'auto',
    gravity = 'center'
  } = options;

  const transformations: string[] = [];

  // Dimensions
  transformations.push(`w_${width}`);
  transformations.push(`h_${height}`);
  transformations.push('c_fill'); // Fill to exact dimensions
  transformations.push(`g_${gravity}`); // Gravity

  // Quality
  transformations.push(`q_${quality}`);

  // Format
  if (format === 'auto') {
    transformations.push('f_auto');
  }

  const transformString = transformations.join(',');
  const fileFormat = format === 'auto' ? 'jpg' : format;

  return `https://res.cloudinary.com/${cloudName}/video/upload/${transformString}/${publicId}.${fileFormat}`;
};

/**
 * Get responsive video sources for different screen sizes
 * @param publicId - Cloudinary public ID for the video
 */
export const getResponsiveVideoSources = (publicId: string) => {
  return [
    {
      src: getVideoUrl(publicId, { maxWidth: 640 }),
      type: 'video/mp4',
      media: '(max-width: 640px)',
      label: 'Mobile'
    },
    {
      src: getVideoUrl(publicId, { maxWidth: 1024 }),
      type: 'video/mp4',
      media: '(max-width: 1024px)',
      label: 'Tablet'
    },
    {
      src: getVideoUrl(publicId, { maxWidth: 1920 }),
      type: 'video/mp4',
      media: '(min-width: 1921px)',
      label: 'Desktop'
    }
  ];
};
