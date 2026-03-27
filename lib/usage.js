import { supabase } from './supabase'

// SET TO HIGH NUMBER FOR TESTING — change back to 1 and 5 when going live
const FREE_SHORTLISTS = 999
const FREE_REVIEWS = 999

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) return null
  return data
}

export async function canUseShortlist(userId) {
  if (!userId) return false
  const profile = await getProfile(userId)
  if (!profile) return false
  if (profile.is_unlimited) return true
  return profile.shortlists_used < FREE_SHORTLISTS
}

export async function canUseReview(userId) {
  if (!userId) return false
  const profile = await getProfile(userId)
  if (!profile) return false
  if (profile.is_unlimited) return true
  return profile.reviews_used < FREE_REVIEWS
}

export async function incrementShortlist(userId) {
  const profile = await getProfile(userId)
  if (!profile || profile.is_unlimited) return
  await supabase
    .from('profiles')
    .update({ shortlists_used: (profile.shortlists_used || 0) + 1 })
    .eq('id', userId)
}

export async function incrementReview(userId) {
  const profile = await getProfile(userId)
  if (!profile || profile.is_unlimited) return
  await supabase
    .from('profiles')
    .update({ reviews_used: (profile.reviews_used || 0) + 1 })
    .eq('id', userId)
}

export async function getRemaining(userId) {
  if (!userId) return { shortlists: 0, reviews: 0, unlimited: false }
  const profile = await getProfile(userId)
  if (!profile) return { shortlists: 0, reviews: 0, unlimited: false }
  if (profile.is_unlimited) return { shortlists: 999, reviews: 999, unlimited: true }
  return {
    shortlists: Math.max(0, FREE_SHORTLISTS - (profile.shortlists_used || 0)),
    reviews: Math.max(0, FREE_REVIEWS - (profile.reviews_used || 0)),
    unlimited: false
  }
}

export async function unlockUnlimited(userId) {
  await supabase
    .from('profiles')
    .update({ is_unlimited: true, paid_at: new Date().toISOString() })
    .eq('id', userId)
}
