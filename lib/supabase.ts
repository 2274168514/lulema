import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://owdbswjdybicrbdvvrkj.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_5QswQz8Q6r4LmApO7GqwQg_mwGiBkLi'

export const supabase = createClient(supabaseUrl, supabaseKey)
