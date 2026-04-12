"use client";

import { useState, useEffect } from "react";
import { FileText, Plus, Search, Eye, Trash2, RefreshCw, Calendar, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  featured_image: string;
  author: string;
  status: 'draft' | 'published';
  published_at: string;
  views: number;
  created_at: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "general",
    featured_image: "",
    author: "Admin"
  });

  const supabase = createClient();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
    setPosts(data || []);
    setLoading(false);
  };

  const createPost = async () => {
    if (!newPost.title) {
      toast.error("Title required");
      return;
    }

    const slug = newPost.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const { error } = await supabase.from('blog_posts').insert({
      ...newPost,
      slug,
      status: 'draft',
      views: 0
    });

    if (!error) {
      toast.success("Post created!");
      setShowCreate(false);
      setNewPost({ title: "", excerpt: "", content: "", category: "general", featured_image: "", author: "Admin" });
      fetchPosts();
    }
  };

  const deletePost = async (id: number) => {
    if (!confirm("Delete this post?")) return;
    await supabase.from('blog_posts').delete().eq('id', id);
    toast.success("Deleted");
    fetchPosts();
  };

  const publishPost = async (id: number) => {
    await supabase.from('blog_posts').update({ status: 'published', published_at: new Date().toISOString() }).eq('id', id);
    toast.success("Published!");
    fetchPosts();
  };

  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = [...new Set(posts.map(p => p.category))];

  if (loading) {
    return <div className="p-6 flex items-center justify-center"><RefreshCw className="w-6 h-6 animate-spin text-[#3ECF8E]" /></div>;
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Blog & Content</h1>
          <p className="text-sm text-[#717171]">Manage your blog posts and articles</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-[#3ECF8E] hover:bg-[#34b27b] text-white">
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-[#717171] uppercase">Total Posts</p>
            <p className="text-xl font-bold">{posts.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-[#717171] uppercase">Published</p>
            <p className="text-xl font-bold text-green-600">{posts.filter(p => p.status === 'published').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-[#717171] uppercase">Total Views</p>
            <p className="text-xl font-bold">{posts.reduce((sum, p) => sum + (p.views || 0), 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-[#717171] uppercase">Categories</p>
            <p className="text-xl font-bold">{categories.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717171]" />
          <Input 
            placeholder="Search posts..." 
            className="pl-9 bg-[#F3F3F1] border-[#E5E5E1]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Posts List */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-[#F3F3F1] border-b border-[#E5E5E1]">
              <tr>
                <th className="text-left text-xs font-medium text-[#717171] p-3">Title</th>
                <th className="text-left text-xs font-medium text-[#717171] p-3">Category</th>
                <th className="text-left text-xs font-medium text-[#717171] p-3">Author</th>
                <th className="text-center text-xs font-medium text-[#717171] p-3">Views</th>
                <th className="text-center text-xs font-medium text-[#717171] p-3">Status</th>
                <th className="text-center text-xs font-medium text-[#717171] p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-[#717171]">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-[#A3A3A3]" />
                    <p>No posts yet</p>
                  </td>
                </tr>
              ) : filteredPosts.map((post) => (
                <tr key={post.id} className="border-b border-[#E5E5E1] hover:bg-[#F3F3F1]">
                  <td className="p-3">
                    <p className="text-sm font-medium">{post.title}</p>
                    <p className="text-xs text-[#717171] truncate max-w-xs">{post.excerpt}</p>
                  </td>
                  <td className="p-3">
                    <Badge variant="outline" className="text-[10px]">{post.category}</Badge>
                  </td>
                  <td className="p-3 text-sm text-[#717171]">{post.author}</td>
                  <td className="p-3 text-center text-sm">{post.views || 0}</td>
                  <td className="p-3 text-center">
                    <Badge className={post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                      {post.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button size="sm" variant="ghost" onClick={() => window.open(`/blog/${post.slug}`, '_blank')}>
                        <Eye className="w-3 h-3" />
                      </Button>
                      {post.status === 'draft' && (
                        <Button size="sm" variant="ghost" onClick={() => publishPost(post.id)}>
                          <FileText className="w-3 h-3 text-green-600" />
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => deletePost(post.id)}>
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-[#E5E5E1]">
              <h3 className="font-semibold">Create New Post</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowCreate(false)}>×</Button>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-[#717171]">Title *</label>
                <Input 
                  value={newPost.title}
                  onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                  placeholder="Post title"
                  className="bg-[#F3F3F1] border-[#E5E5E1]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-[#717171]">Category</label>
                <select 
                  value={newPost.category}
                  onChange={(e) => setNewPost({...newPost, category: e.target.value})}
                  className="w-full p-2 bg-[#F3F3F1] border-[#E5E5E1] rounded-lg"
                >
                  <option value="general">General</option>
                  <option value="technology">Technology</option>
                  <option value="business">Business</option>
                  <option value="tips">Tips & Tricks</option>
                  <option value="news">News</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-[#717171]">Excerpt (short summary)</label>
                <textarea 
                  value={newPost.excerpt}
                  onChange={(e) => setNewPost({...newPost, excerpt: e.target.value})}
                  className="w-full h-16 p-3 bg-[#F3F3F1] border-[#E5E5E1] rounded-lg text-sm resize-none"
                  placeholder="Brief summary..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-[#717171]">Content</label>
                <textarea 
                  value={newPost.content}
                  onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                  className="w-full h-40 p-3 bg-[#F3F3F1] border-[#E5E5E1] rounded-lg text-sm resize-none"
                  placeholder="Full article content..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-[#717171]">Featured Image URL</label>
                <Input 
                  value={newPost.featured_image}
                  onChange={(e) => setNewPost({...newPost, featured_image: e.target.value})}
                  placeholder="https://..."
                  className="bg-[#F3F3F1] border-[#E5E5E1]"
                />
              </div>
            </div>

            <div className="p-4 border-t border-[#E5E5E1] flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button className="bg-[#3ECF8E] hover:bg-[#34b27b] text-white" onClick={createPost}>
                Create Post
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}