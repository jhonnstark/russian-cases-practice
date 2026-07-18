import fs from 'node:fs'
import path from 'node:path'

const dataDir = path.resolve('data', 'russian')
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'))
const unique = (items) => [...new Set(items.filter(Boolean))]
const fail = (message) => failures.push(message)

const failures = []
const warnings = []

const recommend = readJson('recommend-dish-campaign.json').recommend_dish_campaign
const touristCards = readJson('tourist-cards.json').tourist_cards
const roleCards = readJson('role-cards.json').role_cards
const taxonomy = readJson('tag-taxonomy.json').tag_taxonomy

const dishes = recommend.dishes || []
const dishTags = unique(dishes.flatMap((dish) => dish.tags || []))
const taxonomyTags = new Set(taxonomy.map((tag) => tag.id))
const dishByName = new Map(dishes.map((dish) => [dish.name, dish]))

for (const tag of dishTags) {
  if (!taxonomyTags.has(tag)) fail(`Dish tag "${tag}" is missing from tag-taxonomy.json`)
}

const cardTagRefs = []
for (const card of [...touristCards, ...roleCards]) {
  for (const field of ['likedTags', 'dislikedTags']) {
    for (const tag of card[field] || []) {
      cardTagRefs.push(tag)
      if (!taxonomyTags.has(tag)) fail(`Card "${card.id}" references unknown tag "${tag}"`)
      if (!dishTags.includes(tag)) warnings.push(`Card "${card.id}" references tag "${tag}" that no current dish has`)
    }
  }
}

for (const tag of taxonomyTags) {
  const usedByDish = dishTags.includes(tag)
  const usedByCard = cardTagRefs.includes(tag)
  if (!usedByDish && !usedByCard) warnings.push(`Taxonomy tag "${tag}" is currently unused by dishes/cards`)
}

for (const card of touristCards) {
  for (const recommendation of card.bestRecommendations || []) {
    const dish = dishByName.get(recommendation)
    if (!dish) {
      fail(`Tourist card "${card.id}" recommends unknown dish "${recommendation}"`)
      continue
    }

    const liked = card.likedTags || []
    const disliked = card.dislikedTags || []
    const dishTagSet = new Set(dish.tags || [])
    const hasLikedTag = liked.length === 0 || liked.some((tag) => dishTagSet.has(tag))
    const hasDislikedTag = disliked.some((tag) => dishTagSet.has(tag))

    if (!hasLikedTag) fail(`Recommended dish "${recommendation}" for "${card.id}" does not match any likedTags`)
    if (hasDislikedTag) fail(`Recommended dish "${recommendation}" for "${card.id}" matches a dislikedTag`)
  }
}

const report = {
  dishCount: dishes.length,
  dishTags: dishTags.sort(),
  cardTagRefs: unique(cardTagRefs).sort(),
  warningCount: warnings.length,
  warnings,
  failureCount: failures.length,
  failures,
}

console.log(JSON.stringify(report, null, 2))

if (failures.length) process.exit(1)
