import { v2 as cloudinary } from 'cloudinary';
import * as dotenv from 'dotenv';

dotenv.config();

cloudinary.config({ 
    cloud_name: 'dr9a371tx', 
    api_key: '976457912487193', 
    api_secret: 'H8KwmUWG58JZVS8eKOZSrb-mZIY' 
});

async function listAssets() {
    console.log("🔍 FULL INVENTORY SCAN (SEARCHING FOR HIERARCHY)...");

    try {
        const result = await cloudinary.api.resources({
            type: 'upload',
            max_results: 500,
            direction: 'desc',
            sort_by: 'created_at'
        });
        
        const nested = result.resources.filter((r: any) => r.public_id.includes('/'));
        
        console.log(`\n📂 NESTED ASSETS FOUND: ${nested.length}`);
        nested.forEach((r: any) => {
            console.log(` - ${r.public_id} (${r.resource_type})`);
        });

        if (nested.length === 0) {
            console.log("\n⚠️ NO NESTED ASSETS FOUND. ALL ASSETS ARE IN ROOT.");
            console.log("TOP 10 ROOT ASSETS:");
            result.resources.slice(0, 10).forEach((r: any) => {
                console.log(` - ${r.public_id} (${r.resource_type})`);
            });
        }

    } catch (error) {
        console.error("❌ CLOUDINARY API ERROR:", error);
    }
}

listAssets();
