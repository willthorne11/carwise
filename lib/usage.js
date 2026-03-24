const FREE_SHORTLISTS = 1
const FREE_REVIEWS = 5

export function getUsage() {
  if (typeof window === 'undefined') return { shortlists: 0, reviews: 0, unlimited: false }
  return {
    shortlists: parseInt(localStorage.getItem('cw_shortlists') || '0'),
    reviews: parseInt(localStorage.getItem('cw_reviews') || '0'),
    unlimited: localStorage.getItem('cw_unlimited') === 'true'
  }
}

export function canUseShortlist() {
  const { shortlists, unlimited } = getUsage()
  return unlimited || shortlists < FREE_SHORTLISTS
}

export function canUseReview() {
  const { reviews, unlimited } = getUsage()
  return unlimited || reviews < FREE_REVIEWS
}

export function incrementShortlist() {
  const current = parseInt(localStorage.getItem('cw_shortlists') || '0')
  localStorage.setItem('cw_shortlists', current + 1)
}

export function incrementReview() {
  const current = parseInt(localStorage.getItem('cw_reviews') || '0')
  localStorage.setItem('cw_reviews', current + 1)
}

export function unlockUnlimited() {
  localStorage.setItem('cw_unlimited', 'true')
}

export function getRemainingShortlists() {
  const { shortlists, unlimited } = getUsage()
  if (unlimited) return 999
  return Math.max(0, FREE_SHORTLISTS - shortlists)
}

export function getRemainingReviews() {
  const { reviews, unlimited } = getUsage()
  if (unlimited) return 999
  return Math.max(0, FREE_REVIEWS - reviews)
}
