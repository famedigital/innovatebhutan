"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, Image as ImageIcon, FileText, Video, Music, 
  Search, Trash2, Download, Eye, X, Loader2
} from "lucide-react";
import { toast } from "sonner";

interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  created_at: string;
}

export default function MediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const supabase = createClient();

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("media")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load media", { description: error.message });
    } else {
      setMedia(data || []);
    }
    setLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedItems: MediaItem[] = [];

    for (const file of Array.from(files)) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(filePath, file);

      if (uploadError) {
        toast.error("Upload failed", { description: uploadError.message });
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("media")
        .getPublicUrl(filePath);

      const { data: dbData, error: dbError } = await supabase
        .from("media")
        .insert({
          name: file.name,
          url: publicUrl,
          type: file.type.split("/")[0],
          size: file.size,
        })
        .select()
        .single();

      if (dbData) {
        uploadedItems.push(dbData);
      }
    }

    if (uploadedItems.length > 0) {
      setMedia([...uploadedItems, ...media]);
      toast.success("Upload complete", { description: `${uploadedItems.length} file(s) uploaded` });
    }

    setUploading(false);
    e.target.value = "";
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("media")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Delete failed", { description: error.message });
    } else {
      setMedia(media.filter((m) => m.id !== id));
      toast.success("Deleted", { description: "Media item removed" });
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image": return <ImageIcon className="w-5 h-5" />;
      case "video": return <Video className="w-5 h-5" />;
      case "audio": return <Music className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const filteredMedia = media.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || item.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Media Library</h1>
          <p className="text-sm text-[#717171]">Manage your images, videos, and files</p>
        </div>
        <label>
          <input
            type="file"
            multiple
            onChange={handleUpload}
            className="hidden"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
          />
          <Button 
            className="bg-[#3ECF8E] hover:bg-[#32e612] text-black font-medium"
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            Upload
          </Button>
        </label>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
          <Input
            placeholder="Search media..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-[#E5E5E1]"
          />
        </div>
        <div className="flex gap-2">
          {["all", "image", "video", "audio", "application"].map((type) => (
            <Button
              key={type}
              variant={selectedType === type ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType(type)}
              className={selectedType === type ? "bg-[#3ECF8E] text-black hover:bg-[#32e612]" : "border-[#E5E5E1]"}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#3ECF8E]" />
        </div>
      ) : filteredMedia.length === 0 ? (
        <Card className="border-[#E5E5E1]">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <ImageIcon className="w-12 h-12 text-[#A3A3A3] mb-4" />
            <p className="text-[#717171] font-medium">No media files found</p>
            <p className="text-sm text-[#A3A3A3]">Upload files to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredMedia.map((item) => (
            <Card key={item.id} className="border-[#E5E5E1] overflow-hidden group">
              <div className="aspect-square relative bg-[#FAFAFA]">
                {item.type === "image" ? (
                  <img 
                    src={item.url} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-[#3ECF8E]">
                      {getFileIcon(item.type)}
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button 
                    size="icon" 
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                    onClick={() => window.open(item.url, "_blank")}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                    onClick={() => window.open(item.url, "_blank")}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost"
                    className="text-red-400 hover:bg-red-500/20"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-3">
                <p className="text-sm font-medium text-[#1A1A1A] truncate">{item.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <Badge variant="outline" className="text-[10px]">{item.type}</Badge>
                  <span className="text-[10px] text-[#717171]">{formatSize(item.size)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}