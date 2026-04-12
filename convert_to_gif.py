from moviepy.editor import VideoFileClip
import os

# Input and output paths
input_video = "v0 template/public/hero/innovatelogo.mp4"
output_gif = "v0 template/public/hero/innovatelogo.gif"

# Load video
clip = VideoFileClip(input_video)

# Resize to reasonable dimensions for web (width=200)
clip = clip.resize(height=100)

# Write GIF
clip.write_gif(output_gif, fps=10, program='ffmpeg')

print(f"GIF created: {output_gif}")
print(f"Size: {os.path.getsize(output_gif) / 1024:.1f} KB")