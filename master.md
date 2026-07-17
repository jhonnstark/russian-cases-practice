# Russian Learning RPG
## Master Design Document (MDD)

> Version: 1.0
> Status: Living document
> Purpose: Define the architecture, philosophy, progression, content system, and exercise engine for the Russian Learning RPG.

---

# Vision

The objective is **NOT** to build another flashcard app.

The objective is to build the best Russian learning experience possible.

The learner should feel they are progressing through a game rather than studying grammar.

Grammar should become a tool for solving real-life situations.

The project must prioritize:

- Fun
- Repetition without boredom
- Context
- Progressive difficulty
- Massive content reuse
- Semantic correctness

The system should eventually support A1 → B2.

---

# Core Principles

## Learn by Context

Never teach:

```
Instrumental Case
```

Instead teach:

```
I drink tea with lemon.
```

The learner naturally discovers Instrumental.

---

## Vocabulary First

Every campaign introduces vocabulary first.

Then grammar.

Then conversations.

Then missions.

---

## Content Driven

The game engine should never contain hardcoded lessons.

Everything must come from JSON.

Campaigns

Vocabulary

Dialogs

Exercises

NPCs

Bosses

Reading texts

Everything.

---

## Reusable Content

Every word should appear in many different activities.

Example:

борщ

↓

Image

↓

Vocabulary

↓

Accusative

↓

Instrumental

↓

Restaurant

↓

Russian Cuisine

↓

Reading

↓

Conversation

↓

Boss

The learner sees the same vocabulary naturally many times.

---

# Learning Loop

Every campaign follows the same loop.

Vocabulary

↓

Recognition

↓

Grammar

↓

Mini Games

↓

Sentence Builder

↓

Dialogue

↓

Mission

↓

Boss

↓

Review

↓

Spaced Repetition

---

# Campaign System

The game is organized into thematic campaigns.

## Planned campaigns

Food & Drinks

Restaurant

Shopping

Cooking

Russian Cuisine

Travel

Hotel

Airport

Transport

Family

Friends

University

Work

Technology

Shopping

Health

Sports

Nature

Weather

Culture

Russian Holidays

Music

Cinema

Literature

Each campaign contains:

Vocabulary

Grammar

Reading

Dialogue

Mini Games

Mission

Boss

Review

---

# Grammar Engine

The grammar engine supports:

Genitive

Accusative

Prepositional

Dative

Instrumental

Verb Aspects

Comparatives

Conjugations

Pronouns

Adjectives

Prepositions

Grammar is always introduced through context.

---

# Vocabulary Engine

Every vocabulary item contains structured information.

Example

```json
{
  "word":"борщ",
  "translation":"borscht",
  "level":"A1",
  "gender":"masculine",
  "stress":"борщ",
  "semanticTags":[
    "food",
    "restaurant",
    "russian_cuisine",
    "soup"
  ],
  "campaigns":[
    "food",
    "restaurant",
    "culture"
  ],
  "learningScore":8
}
```

Vocabulary should never exist in isolation.

Every word belongs to multiple campaigns.

---

# Semantic Graph

Every noun should connect to:

verbs

adjectives

cases

phrases

images

campaigns

reading texts

dialogues

Example

борщ

↓

Ingredients

свёкла

капуста

морковь

лук

мясо

↓

Verbs

есть

готовить

варить

↓

Instrumental

со сметаной

↓

Accusative

люблю борщ

↓

Reading

Russian Cuisine

↓

Restaurant

↓

Culture

---

# Exercise Library

The game should support many exercise types.

## Vocabulary

Image → Word

Word → Image

Category Match

Memory Cards

Typing

Audio Recognition

Find the Odd One

Shopping Game

Recipe Builder

---

## Grammar

Fill Ending

Multiple Choice

Drag Ending

Sentence Builder

Error Correction

Declension Builder

Case Recognition

Case Transformation

---

## Verb Aspect

Choose Aspect

Timeline

Perfective vs Imperfective

Aspect Story

Aspect Switch

---

## Comparatives

Fill Comparison

Image Comparison

Travel Comparison

Food Comparison

City Comparison

Choose Better Option

---

## Reading

Fill Missing Words

Answer Questions

Extract Vocabulary

Summarize

Paragraph Order

---

## Writing

Describe Picture

Recommend Dish

Travel Diary

Restaurant Review

Short Story

Recipe

---

## Dialogue

Dialogue Builder

Recommendation

Persuasion

Opinion Builder

Choice Cards

Role Cards

Mission Dialogues

---

# Campaign Template

Every campaign follows exactly the same structure.

1. Introduction

2. Vocabulary

3. Grammar

4. Recognition

5. Mini Games

6. Reading

7. Dialogue

8. Mission

9. Boss

10. Review

---

# Mission System

The learner should always have objectives.

Examples

Buy groceries

Cook dinner

Order food

Recommend a dish

Plan a trip

Visit a museum

Meet a friend

Invite family

Celebrate New Year

Every mission naturally practices grammar.

---

# Boss Battles

The last lesson is never simple multiple choice.

Bosses combine:

Vocabulary

Grammar

Comparatives

Cases

Reading

Dialogue

Writing

---

# Progression

The learner earns:

XP

Stars

Coins

Achievements

Campaign Completion

Collections

Daily Streak

---

# Spaced Repetition

The game tracks:

Correct answers

Mistakes

Last review

Difficulty

Learning score

Weak vocabulary

Cases that need review

Review should happen naturally inside campaigns.

---

# Content Philosophy

Every screenshot extracted from textbooks should generate:

Vocabulary

Grammar

Dialogues

Reading

Campaign ideas

Mini Games

Semantic relations

Example sentences

Everything should become reusable content.

---

# Semantic Validation

The generator must avoid absurd sentences.

Bad:

Я ем автобус.

Good:

Я ем борщ.

The engine must prioritize semantic compatibility over randomness.

---

# Variety Rules

The generator should avoid repeating the same nouns.

Words with learningScore 10 should NOT dominate early exercises.

Rotation should consider:

learningScore

frequency

lastUsed

semantic category

difficulty

campaign

Exercises should expose learners to a broad vocabulary.

---

# Future Features (Version 2)

AI conversations

Speaking

Pronunciation feedback

Open roleplay

Adaptive NPCs

Conversation memory

Personal tutor

These are future additions.

The current architecture must allow them without redesigning the engine.

---

# Development Priorities

Current priority:

1. Stable exercise engine

2. Campaign engine

3. Vocabulary database

4. Grammar engine

5. Progress tracking

6. Spaced repetition

7. Content extraction

Do NOT prioritize AI until the foundations are complete.

---

# Content Extraction Workflow

Every textbook page or screenshot should be converted into:

Vocabulary

Verb pairs

Grammar

Comparatives

Dialogues

Reading

Semantic tags

Campaign ideas

Exercise ideas

Culture

The content database is the most valuable asset of the project.

Every extracted item should be reusable across multiple campaigns.

---

# Long-Term Goal

The learner should never feel like they are memorizing grammar.

Instead, they should feel like they are:

ordering food

travelling

shopping

meeting friends

studying

working

celebrating holidays

discovering Russian culture

while naturally acquiring the language through meaningful repetition.

# Golden Rule

Never build features for a single lesson.

Always build systems.

Never build a "Restaurant Exercise".

Build a "Recommendation System" that can later be used for:

- Food
- Travel
- Hotels
- Movies
- Music
- Cities
- Books
- Sports

Never hardcode content.

Always design reusable engines that consume JSON.

The content database should grow forever without requiring engine changes.