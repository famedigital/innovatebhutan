import { v2 as cloudinary } from 'cloudinary';
import * as dotenv from 'dotenv';

dotenv.config();

cloudinary.config({ 
    cloud_name: 'dr9a371tx', 
    api_key: '976457912487193', 
    api_secret: 'H8KwmUWG58JZVS8eKOZSrb-mZIY' 
});

const renamingMap = [
    { from: 'IMG_5247_uciejk', to: 'innovate_bhutan/hero_main_video', type: 'video' },
    { from: 'IMG_6336_s0ocov', to: 'innovate_bhutan/pos_systems_video', type: 'video' },
    { from: 'IMG_7123_xhwrr4', to: 'innovate_bhutan/security_ai_node', type: 'image' },
    { from: 'IMG_7574_n0gzus', to: 'innovate_bhutan/pos_engineering', type: 'image' },
    { from: 'IMG_8058_m49iq1', to: 'innovate_bhutan/hospitality_tech', type: 'image' },
    { from: 'IMG_9326_uunzcu', to: 'innovate_bhutan/network_flow', type: 'image' },
    { from: 'IMG_8653_sb2qfo', to: 'innovate_bhutan/surveillance_ai', type: 'image' },
    { from: 'IMG_9770_brm3s4', to: 'innovate_bhutan/software_dev', type: 'image' },
    { from: 'IMG_7291_pob41g', to: 'innovate_bhutan/services_main_hero', type: 'image' },
    { from: 'IMG_7752_dfdsbl', to: 'innovate_bhutan/biometric_id', type: 'image' },
    { from: 'IMG_9325_h4aiwx', to: 'innovate_bhutan/power_resilience', type: 'image' }
];

async function renameAssets() {
    console.log("🛠️ STARTING CLOUDINARY RE-ARCHITECTING...");

    for (const item of renamingMap) {
        try {
            console.log(`🔄 RENAMING ${item.from} -> ${item.to} (${item.type})...`);
            await cloudinary.uploader.rename(item.from, item.to, { 
                resource_type: item.type,
                overwrite: true 
            });
            console.log(`✅ SUCCESS: ${item.to}`);
        } catch (error: any) {
            console.error(`❌ FAILED ${item.from}:`, error.message);
        }
    }
    console.log("\n🚀 RE-ARCHITECTING COMPLETE.");
}

renameAssets();
