"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();
  const [data, setData] = useState({ name: "", password: "", age: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          password: data.password,
          age: data.age ? parseInt(data.age) : undefined,
        }),
      });

      if (res.ok) {
        router.push("/login?registered=true");
      } else {
        const err = await res.json();
        setError(err.message || "注册失败，请重试");
      }
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 safe-top safe-bottom">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        {/* Logo & 标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-3">加入修行</h1>
          <p className="text-ios-gray-1 text-base">开启你的自律之旅</p>
        </div>

        {/* 注册表单 - 玻璃卡片 */}
        <div className="glass-card p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="法号（昵称）"
                className="input-field"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                required
                minLength={2}
                autoComplete="username"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="密码（至少6位）"
                className="input-field"
                value={data.password}
                onChange={(e) => setData({ ...data, password: e.target.value })}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="年龄（选填）"
                className="input-field"
                value={data.age}
                onChange={(e) => setData({ ...data, age: e.target.value })}
                min={1}
                max={150}
              />
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-danger text-sm text-center"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-capsule btn-capsule-primary w-full mt-2"
            >
              {loading ? "创建中..." : "注册"}
            </button>
          </form>
        </div>

        {/* 登录链接 */}
        <div className="text-center">
          <Link 
            href="/login" 
            className="text-ios-gray-1 text-sm hover:text-primary transition-colors"
          >
            已有账号？<span className="text-primary font-medium">立即登录</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
