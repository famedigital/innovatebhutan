import { v2 as cloudinary } from 'cloudinary';
import * as dotenv from 'dotenv';

dotenv.config();

cloudinary.config({ 
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

async function runTest() {
    console.log("🚀 INITIALIZING CLOUDINARY UPLOAD TEST...");

    try {
        // Upload sample image
        const uploadResult = await cloudinary.uploader.upload(
            'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', 
            { public_id: 'shoes_test' }
        );
        
        console.log("✅ UPLOAD SUCCESSFUL:", uploadResult.secure_url);

        // Optimize URL
        const optimizeUrl = cloudinary.url('shoes_test', {
            fetch_format: 'auto',
            quality: 'auto'
        });
        
        console.log("🎯 OPTIMIZED URL:", optimizeUrl);

        // Auto-Crop URL
        const autoCropUrl = cloudinary.url('shoes_test', {
            crop: 'auto',
            gravity: 'auto',
            width: 500,
            height: 500,
        });
        
        console.log("📐 AUTO-CROP URL:", autoCropUrl);
    } catch (error) {
        console.error("❌ CLOUDINARY ERROR:", error);
    }
}

runTest();
