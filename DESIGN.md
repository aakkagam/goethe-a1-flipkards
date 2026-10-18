<!-- SEED: re-run /impeccable document once there's code to capture the actual tokens and components. -->
---
name: Goethe A1 Flipkards
description: Calm, thumb-first flip cards for the Goethe A1 word list.
---

# Design System: Goethe A1 Flipkards

## 1. Overview

**Creative North Star: "The Moss Desk"**

A single paper card resting on a quiet field of sage. The field carries the color; the card carries the word. Everything else (progress, controls, the translation) stays in the margins until the learner reaches for it. The feel borrows from Things and Bear: native-polished, considered spacing, nothing shouting.

Scene: a learner on a commute or a break, phone in one hand, in daylight one day and a dim train the next. The theme follows the system setting (light and dark both first-class); sage stays the field in both.

Motion is responsive, not choreographed: the flip, the swipe to known/unknown, and the translation reveal give clear physical feedback, then settle. Nothing animates for its own sake.

This system rejects Duolingo-style gamification, German flag colors, the generic SaaS template, and the cluttered textbook.

**Key Characteristics:**
- One card per screen, centered in a sage field.
- Serif word, sans everything else.
- Flat at rest; lift only while the card is being handled.
- Controls live in the bottom third, within thumb reach.

## 2. Colors

Committed sage: one muted green-grey owns the surface, paper neutrals carry the content.

### Primary
- **Moss Field** ([to be resolved during implementation]): the app background behind the card, 30 to 60% of every screen. Low chroma; it should read as calm ground, not as a brand splash.

### Neutral
- **Card Paper** ([to be resolved during implementation]): the card face. Warm off-white in light mode, deep moss-tinted charcoal in dark mode.
- **Ink** ([to be resolved during implementation]): word and body text, tinted toward the sage hue.
- **Margin Grey** ([to be resolved during implementation]): secondary text, progress, hints.

### Named Rules
**The Committed Field Rule.** Sage is the ground, not the accent. It fills the field; it never becomes buttons, badges, or highlights scattered across the card.

**The No Flag Rule.** Black, red, and gold together are prohibited. Known/unknown states use tone and icon, not traffic-light red and green.

## 3. Typography

**Display Font:** [serif to be chosen at implementation]
**Body Font:** [sans to be chosen at implementation]

**Character:** A characterful serif gives the German word presence on the card; a quiet sans handles meaning, sentences, and UI so the word stays the hero.

### Hierarchy
- **Display** (serif): the German word on the card front. The largest thing on screen.
- **Title** (serif or sans, smaller): the word repeated on the card back.
- **Body** (sans): meaning, example sentence, translation. Max 65 to 75ch.
- **Label** (sans): article, plural, progress count, control labels.

### Named Rules
**The Article Stays Attached Rule.** Article and plural are always visible with the word, never tucked behind a tap.

## 4. Elevation

Flat by default. The card sits on the field with tonal contrast only; a soft lift appears only while it is dragged or flipping, then returns to flat.

## 6. Do's and Don'ts

### Do:
- **Do** keep one card centered and every core action (flip, known, unknown, reveal translation) in the bottom third of a phone screen.
- **Do** hide the English translation until the learner asks for it.
- **Do** state progress plainly ("12 left, 30 known") in Margin Grey.
- **Do** honor `prefers-reduced-motion`: replace the flip with a crossfade.

### Don't:
- **Don't** use Duolingo-style gamification: mascots, streak guilt, confetti, XP, leaderboards.
- **Don't** use German flag colors (black, red, gold) or other national clichés.
- **Don't** build the generic SaaS template: gradient hero, identical card grids, stat tiles.
- **Don't** make it a cluttered textbook: dense tables, tiny type, everything on screen at once.
- **Don't** use bounce or elastic easing on the flip or swipe; ease out (quart/expo) and settle.
- **Don't** use a modal for the translation or word details; reveal inline on the card.
