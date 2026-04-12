/**
 * 🛰️ CLOUDINARY MEDIA ARCHITECT
 * Pure Client-Side Utility (Safe for Browser)
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
