import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { startOfDay, subDays } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // 1. 创建陈柏文账号
  const name = "陈柏文";
  const password = "123123";
  const hashedPassword = await hash(password, 10);

  // 清理旧数据（如果存在）
  const existing = await prisma.user.findUnique({ where: { name } });
  if (existing) {
    await prisma.user.delete({ where: { name } });
  }

  const user = await prisma.user.create({
    data: {
      name,
      password: hashedPassword,
      age: 20,
      merit: 9178,
      currentStreak: 10,
      maxStreak: 15,
      totalTakeoffs: 999,
      startDate: new Date("2025-01-01"),
    },
  });

  console.log(`👤 Created user: ${user.name}`);

  // 2. 生成全红日历（过去30天全是起飞）
  const today = new Date();
  const records = [];

  for (let i = 0; i < 30; i++) {
    const date = startOfDay(subDays(today, i));
    records.push({
      userId: user.id,
      date: date,
      status: "TAKEOFF",
      duration: 30 + Math.floor(Math.random() * 60), // 随机时长
      method: ["日剧", "韩剧", "欧美", "国产", "动漫", "直播", "干起"][Math.floor(Math.random() * 7)],
      note: `这是陈柏文第 ${999 - i} 次起飞的心得，感觉索然无味。`,
    });
  }
  
  // 插入 DailyRecord
  // 由于 SQLite 不支持 createMany，我们需要循环插入或使用 transaction
  await prisma.$transaction(
    records.map((record) => prisma.dailyRecord.create({ data: record }))
  );
  
  console.log(`📅 Generated 30 days of red calendar records`);

  // 3. 生成社区心得
  // 自律心得 (对应自律专区)
  const persistPosts = [
    "虽然起飞了999次，但我依然向往自律。",
    "今天忍住没起飞，打卡第10天！",
    "自律的快乐你们想象不到（骗人的）。",
  ];

  // 起飞心得 (对应鹿王专区)
  const takeoffPosts = [
    "第999次起飞，为了庆祝这个数字。",
    "看《黑暗荣耀》没忍住。",
    "起飞是人类进步的阶梯。",
    "没什么好说的，就是想冲。",
    "又破戒了，明天一定改。",
  ];

  const posts = [
    ...persistPosts.map(content => ({
      userId: user.id,
      content,
      type: "SELF_DISCIPLINE",
      likes: Math.floor(Math.random() * 100),
    })),
    ...takeoffPosts.map(content => ({
      userId: user.id,
      content,
      type: "日剧", // 随机选一个分类
      likes: Math.floor(Math.random() * 500), // 鹿王更受欢迎
    }))
  ];

  await prisma.$transaction(
    posts.map((post) => prisma.post.create({ data: post }))
  );

  console.log(`📝 Created ${posts.length} community posts`);
  console.log("✅ Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
