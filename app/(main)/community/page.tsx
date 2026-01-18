"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Heart } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<"SELF_DISCIPLINE" | "DEER_KING">("SELF_DISCIPLINE");
  const { data: posts, isLoading } = useSWR(`/api/community/posts?type=${activeTab}`, fetcher);
  const [isPosting, setIsPosting] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [posting, setPosting] = useState(false);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    
    setPosting(true);
    await fetch("/api/community/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newContent, type: activeTab }),
    });
    
    setNewContent("");
    setIsPosting(false);
    setPosting(false);
    mutate(`/api/community/posts?type=${activeTab}`);
  };

  const handleLike = async (postId: string, currentLiked: boolean) => {
    // 乐观更新 UI
    mutate(
      `/api/community/posts?type=${activeTab}`,
      (currentData: any[]) => {
        return currentData.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              liked: !currentLiked,
              likes: currentLiked ? post.likes - 1 : post.likes + 1,
            };
          }
          return post;
        });
      },
      false
    );

    try {
      await fetch("/api/community/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });
      // 可以在这里重新 mutate 确保数据准确，但为了体验暂不强制刷新
    } catch (e) {
      // 失败回滚
      mutate(`/api/community/posts?type=${activeTab}`);
    }
  };

  return (
    <div className="min-h-screen pb-24 safe-top">
      {/* 顶部 Tab 切换 */}
      <div className="sticky top-0 z-30 px-5 pt-6 pb-4 glass-nav">
        <div className="glass-card p-1 flex">
          {[
            { key: "SELF_DISCIPLINE", label: "自律专区" },
            { key: "DEER_KING", label: "鹿王专区" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 py-3 text-sm font-medium rounded-[20px] transition-all duration-200 ${
                activeTab === tab.key
                  ? "bg-white text-primary shadow-sm"
                  : "text-ios-gray-1"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 帖子列表 */}
      <div className="px-5 space-y-4 mt-2">
        {isLoading ? (
          <div className="text-center py-10 text-ios-gray-1">加载中...</div>
        ) : posts?.length === 0 ? (
          <div className="text-center py-10 text-ios-gray-1">暂无帖子，快来抢沙发</div>
        ) : (
          posts?.map((post: any, index: number) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card p-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-primary font-bold">
                  {post.user?.name?.[0] || "匿"}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{post.user?.name || "无名居士"}</div>
                  <div className="text-xs text-ios-gray-1">功德 {post.user?.merit || 0}</div>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-gray-700 mb-3">{post.content}</p>
              
              {/* 底部操作栏 */}
              <div className="flex items-center justify-end border-t border-gray-100 pt-2">
                <button
                  onClick={() => handleLike(post.id, post.liked)}
                  className={`flex items-center gap-1.5 text-sm transition-colors ${
                    post.liked ? "text-danger" : "text-ios-gray-2 hover:text-danger/70"
                  }`}
                >
                  <Heart
                    size={18}
                    fill={post.liked ? "currentColor" : "none"}
                    className={post.liked ? "animate-pulse-once" : ""}
                  />
                  <span>{post.likes || 0}</span>
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* 发布按钮 */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={() => setIsPosting(true)}
        className="fixed bottom-24 right-5 z-40 w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg"
        style={{ boxShadow: "0 4px 20px rgba(0, 122, 255, 0.4)" }}
      >
        <Plus size={24} />
      </motion.button>

      {/* 发布弹窗 */}
      <AnimatePresence>
        {isPosting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
            style={{ backdropFilter: "blur(10px)" }}
            onClick={() => setIsPosting(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-white rounded-t-[28px] p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">
                  发布到{activeTab === "SELF_DISCIPLINE" ? "自律专区" : "鹿王专区"}
                </h3>
                <button onClick={() => setIsPosting(false)} className="p-1">
                  <X size={20} className="text-ios-gray-1" />
                </button>
              </div>
              
              <form onSubmit={handlePost}>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full h-32 p-4 bg-ios-gray-6 rounded-2xl mb-4 focus:ring-2 focus:ring-primary/20 outline-none resize-none text-sm"
                  placeholder="分享你的心得..."
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={posting || !newContent.trim()}
                  className="btn-capsule btn-capsule-primary w-full disabled:opacity-50"
                >
                  {posting ? "发布中..." : "发布"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
