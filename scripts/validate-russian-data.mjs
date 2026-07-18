import fs from 'node:fs'
import path from 'node:path'

const dataDir = path.resolve('data', 'russian')

const readJson = (file) => {
  const fullPath = path.join(dataDir, file)
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'))
}

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

const master = readJson('master-russian-dataset.json')

const mirroredSections = [
  ['association-challenges.json', 'association_challenges'],
  ['conversation-templates.json', 'conversation_templates'],
  ['culture-matching.json', 'culture_matching'],
  ['dialogue-builders.json', 'dialogue_builders'],
  ['dish-builders.json', 'dish_builders'],
  ['dish-profiles.json', 'dish_profiles'],
  ['genitive-preposition-patterns.json', 'genitive_preposition_patterns'],
  ['instrumental-choice-cards.json', 'instrumental_choice_cards'],
  ['missions.json', 'missions'],
  ['national-food.json', 'national_food'],
  ['reading-campaigns.json', 'reading_campaigns'],
  ['recipe-builders.json', 'recipe_builders'],
  ['restaurant-menus.json', 'restaurant_menus'],
  ['restaurant-service-scenarios.json', 'restaurant_service_scenarios'],
  ['role-cards.json', 'role_cards'],
  ['semantic-challenges.json', 'semantic_challenges'],
  ['semantic-collections.json', 'semantic_collections'],
  ['sentence-block-builders.json', 'sentence_block_builders'],
  ['tourist-cards.json', 'tourist_cards'],
  ['unlockable-phrases.json', 'unlockable_phrases'],
  ['verb-object-patterns.json', 'verb_object_patterns'],
]

for (const [file, section] of mirroredSections) {
  const fullPath = path.join(dataDir, file)
  assert(fs.existsSync(fullPath), `Missing data file: ${file}`)

  const data = readJson(file)
  const source = data[section]

  assert(source, `${file} must expose "${section}"`)
  assert(master[section], `master-russian-dataset.json is missing "${section}"`)

  if (Array.isArray(source)) {
    assert(Array.isArray(master[section]), `master "${section}" must be an array`)
    assert(
      master[section].length >= source.length,
      `master "${section}" has fewer items than ${file}`,
    )
  }
}

const recommendDish = readJson('recommend-dish-campaign.json')
assert(recommendDish.recommend_dish_campaign, 'recommend-dish-campaign.json must expose recommend_dish_campaign')
assert(master.recommend_dish_campaign, 'master-russian-dataset.json is missing recommend_dish_campaign')

const campaigns = readJson('campaigns.json').campaigns
const requiredCampaigns = [
  'compare',
  'culture-compare',
  'food',
  'healthy-food',
  'recommend-a-dish',
  'russian-cuisine',
  'supermarket',
]

for (const campaignId of requiredCampaigns) {
  assert(
    campaigns.some((campaign) => campaign.id === campaignId),
    `campaigns.json is missing campaign "${campaignId}"`,
  )
}

const missions = readJson('missions.json').missions
assert(
  missions.some((mission) => mission.id === 'prepare-russian-dinner'),
  'missions.json is missing prepare-russian-dinner',
)

console.log('Russian data validation passed.')
