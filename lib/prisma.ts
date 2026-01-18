import { supabase } from './supabase'

// Helper to get user by name
export async function getUserByName(name: string) {
  const { data, error } = await supabase
    .from('user')
    .select('*')
    .eq('name', name)
    .single()
  
  if (error) return null
  return data
}

// Helper to create user
export async function createUser(data: {
  name: string
  password: string
  age?: number
}) {
  const { data: user, error } = await supabase
    .from('user')
    .insert([{
      name: data.name,
      password: data.password,
      age: data.age || null,
      merit: 0,
      currentStreak: 0,
      maxStreak: 0,
      totalTakeoffs: 0,
      startDate: new Date().toISOString()
    }])
    .select()
    .single()
  
  if (error) throw error
  return user
}

// Helper to get user stats
export async function getUserStats(userId: string) {
  const { data: user } = await supabase
    .from('user')
    .select('merit, currentStreak, maxStreak, totalTakeoffs, startDate, lastCheckIn')
    .eq('id', userId)
    .single()
  
  return user
}

// Helper to get daily records
export async function getDailyRecords(userId: string, year: number, month: number) {
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0)
  
  const { data } = await supabase
    .from('DailyRecord')
    .select('*')
    .eq('userId', userId)
    .gte('date', startDate.toISOString())
    .lte('date', endDate.toISOString())
  
  return data || []
}

// Helper to create daily record
export async function createDailyRecord(data: {
  userId: string
  status: string
  duration?: number
  method?: string
  note?: string
}) {
  const { error } = await supabase
    .from('DailyRecord')
    .insert([{
      userId: data.userId,
      date: new Date().toISOString(),
      status: data.status,
      duration: data.duration || null,
      method: data.method || null,
      note: data.note || null
    }])
  
  if (error) throw error
}

export default {
  user: {
    findUnique: async ({ where }: { where: { name?: string; id?: string } }) => {
      if (where.name) return getUserByName(where.name)
      return null
    },
    create: async ({ data }: { data: any }) => createUser(data)
  },
  dailyRecord: {
    findMany: async () => [],
    create: async ({ data }: { data: any }) => createDailyRecord(data)
  }
}
