export function formatPrice(price) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0
  }).format(price)
}

export function getBuyerProtection(price) {
  return Math.round(Number(price) * 0.08)
}

export function getTotalWithProtection(price) {
  return Number(price) + getBuyerProtection(price)
}

export function getCategoryLabel(category) {
  const labels = {
    women: 'Women',
    men: 'Men',
    kids: 'Kids',
    objects: 'Objects'
  }

  return labels[category] || category
}