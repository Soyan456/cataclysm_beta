# Cataclyzm

A dark, mobile-first fitness and nutrition Progressive Web App built for iPhone 15 (works on any modern phone).
No build step, no dependencies, no account, no server. All data stays on your device.

## Features
- **Calorie ring** showing eaten / allowed, plus protein, carbs and fat in grams
- **Food log** with 80+ built-in foods, custom foods, quick-add, copy-previous-day and automatic unit conversion
  (g, kg, oz, lb, ml, L, fl oz, cup, tbsp, tsp, servings)
- **Adaptive calorie budget** from age, sex, height, weight, body fat, activity, goal (fat loss, weight loss/gain,
  muscle gain, recomposition, maintain), goal weight and timeframe, with safety limits. After two weeks of weigh-ins
  and food logs it compares your real results with the formula and offers a corrected maintenance number.
- **Training** with sets, reps and weights computed from your max lifts, linear progression from your logged
  history, warm-up sets, rest timers, muscle-volume tracking for the past 7 days, exercise swaps and PR detection
- **Coach**: next-meal ideas that fit your remaining macros and what you ate this week, a protein gap closer,
  a live "foods to avoid right now" box, your own avoid/allergy list, and a weekly review
- **Fitness exam**: 8 categories (strength, power, aerobic, anaerobic, muscular endurance, flexibility,
  mental focus, mental health), each scored out of 100 and ranked D / C / B / A / S, with a radar chart
- Extras: morning readiness check-in that scales training volume, hydration tracker, weight trend chart,
  XP/levels/streaks, plate calculator, cardio logging, backup export/import, offline support

## Deploy on GitHub Pages (free)
1. Create a new GitHub repository (for example `cataclyzm`) and upload every file in this folder to the root.
2. Repo **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch `main`, folder `/ (root)`.
3. After about a minute your app is live at `https://<your-username>.github.io/cataclyzm/`.

## Install on iPhone
1. Open the URL in **Safari**.
2. Tap **Share → Add to Home Screen → Add**.
3. Launch it from the home screen. It opens full screen and works offline.

Note: iOS can clear a website's stored data if you do not open the app for a long time. Use
**Profile → Export backup** now and then.

## Updating
Change files, then bump `VERSION` in `sw.js` (for example `cataclyzm-v2`) so phones pick up the new version.

## Disclaimer
Cataclyzm gives general estimates, not medical advice. Check with a doctor or dietitian before major diet or
training changes, especially with a medical condition, pregnancy or a history of disordered eating. Fitness scores
come from general population norms. The mental wellbeing check-in is not a diagnosis.
