"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [data, setData] = useState({ name: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    const result = await signIn("credentials", {
      ...data,
      redirect: false,
    });
    
    setLoading(false);

    if (result?.ok) {
      router.push("/");
    } else {
      setError("昵称或密码错误，请重试");
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
          <h1 className="text-4xl font-bold text-primary mb-3">鹿了么</h1>
          <p className="text-ios-gray-1 text-base">保持专注，功德无量</p>
        </div>

        {/* 登录表单 - 玻璃卡片 */}
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
                autoComplete="username"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="密码"
                className="input-field"
                value={data.password}
                onChange={(e) => setData({ ...data, password: e.target.value })}
                required
                autoComplete="current-password"
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
              {loading ? "登录中..." : "登录"}
            </button>
          </form>
        </div>

        {/* 注册链接 */}
        <div className="text-center">
          <Link 
            href="/register" 
            className="text-ios-gray-1 text-sm hover:text-primary transition-colors"
          >
            还没有账号？<span className="text-primary font-medium">立即注册</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
