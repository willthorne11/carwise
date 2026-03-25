import { supabase } from './supabase'

const FREE_SHORTLISTS = 1
const FREE_REVIEWS = 5

// Get user profile from Supabase
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) return null
  return data
}

// Check if user can run a shortlist
export async function canUseShortlist(userId) {
  if (!userId) return false
  const profile = await getProfile(userId)
  if (!profile) return false
  if (profile.is_unlimited) return true
  return profile.shortlists_used < FREE_SHORTLISTS
}

// Check if user can run a review
export async function canUseReview(userId) {
  if (!userId) return false
  const profile = await getProfile(userId)
  if (!profile) return false
  if (profile.is_unlimited) return true
  return profile.reviews_used < FREE_REVIEWS
}

// Increment shortlist count
export async function incrementShortlist(userId) {
  const profile = await getProfile(userId)
  if (!profile || profile.is_unlimited) return
  await supabase
    .from('profiles')
    .update({ shortlists_used: (profile.shortlists_used || 0) + 1 })
    .eq('id', userId)
}

// Increment review count
export async function incrementReview(userId) {
  const profile = await getProfile(userId)
  if (!profile || profile.is_unlimited) return
  await supabase
    .from('profiles')
    .update({ reviews_used: (profile.reviews_used || 0) + 1 })
    .eq('id', userId)
}

// Get remaining counts
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

// Unlock unlimited — called after successful payment
export async function unlockUnlimited(userId) {
  await supabase
    .from('profiles')
    .update({ is_unlimited: true, paid_at: new Date().toISOString() })
    .eq('id', userId)
}
