# ANSWERS.md

## 1. How to run

No install required.

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`. Alternatively, double-click `index.html`, it runs from `file://` without issues since there are no module imports or fetch calls.

Deployed: `https://sobanmujtaba.github.io/tipper/`

---

## 2. Stack & design choices

**Stack:** Vanilla HTML/CSS/JS in three different files. No framework and no bundler. A tip calculator has zero state complexity, which justifies a framework;  The entire app is approximately 200 lines of JavaScript.

**Visual decision 1 - two-column split, inputs left / outputs right.**
The output panel remains displayed while the user types. This terminates the "type, scroll, read, scroll back" loop. On a 660px viewport, the split is 50:50. The per-person figure is at the bottom of the right column, physically separated by a dark charcoal card; it is the number that people are most concerned about. The layout use Syne for large numbers and DM Mono for all labels and input values, resulting in a clear visual hierarchy.

**Visual decision 2 - active state uses burnt orange, not the default text color.**
The three preset tip buttons start out muted. When clicked, the active one fills with burnt orange ('#d4501a') and changes to white text. This warm colour contrasts with the neutral palette, making the active selection stand out without the need for a label or icon. The same colour appears nowhere else in the program, and it immediately indicates "selected".

---

## 3. Responsive & accessibility

**360px vs 1440px:**
Below 520px, the two-column shell collapses into a single column, with inputs stacked above outputs. At very small sizes, the custom input in the tip row becomes full-width underneath the three preset buttons. At 1440px, the app remains at 660px max-width and centers on the page.

**Accessibility handled:**
- All inputs include `<label>` elements and `aria-describedby` indicating their error elements.
- Error messages are marked with `role="alert"` and `aria-live="polite"`, allowing screen readers to announce them without interruption.
- Preset buttons have `aria-pressed` toggled on click and change colour while active, providing visual assurance.
- The output section has `aria-live="polite"` so screen readers announce result changes.
- Tab order follows DOM order: bill, custom tip, people, reset.
- Enter key on each field advances focus to the next one, which matters on mobile where the keyboard covers the next field.
---

**Accessibility skipped:**
High-contrast mode support (`prefers-contrast: more`). I did not audit every interactive state (focus ring colors, etc.). Fixing it properly requires `forced-colors` media query overrides, skipped due to time.
 
---
 
## 4. AI usage
 
I wrote the base HTML structure and the JS logic myself. During development I ran into bugs like the live recalculation wasn't triggering correctly on preset button clicks, and the error state wasn't clearing properly after reset. I used ChatGPT to help debug those specific issues, pasting the relevant function and describing the behavior. It pointed out that I was reading `activeTip` before updating it in one case, and that `setError` wasn't being called with an empty string on reset for the custom tip field. I made those fixes myself once I understood what was wrong.
 
For the visual design I used Claude. The base HTML was unstyled, and I handed it to Claude with the spec. Claude produced the light-theme CSS with the two-column layout, the Syne + DM Mono typography pairing, and the burnt orange active states for the preset buttons.
 
**One specific change I made to the Claude output:**
Claude's initial output had the per-person card with a muted background. I changed it to the dark charcoal background with white text to create stronger visual emphasis, that's the answer people need, so it should stand out. I also adjusted the output label colors inside the card to use a semi-transparent white instead of the default text color, which provides better contrast against the dark background.
 
---
 
## 5. Honest gap
 
The tip validation allows values above 100% but shows a warning instead of blocking input. The intent was to not block users who legitimately want to double-tip on a small bill. But the warning stays visible while the user keeps typing past 100, which reads as nagging. With another day I would debounce that validation so the message only appears after a short pause in typing, and clears immediately once the value drops back below 100%.
 
---
 
## Rounding policy
 
Per-person amount is rounded up to the nearest 2 decimal places using `Math.ceil(x * 100) / 100`.
 
Splitting Rs 100 among 3 people gives Rs 33.333... The options are Rs 33.33 (group underpays by Rs 0.01) or Rs 33.34 (group overpays by Rs 0.02). Rounding up means the group always covers the full bill plus tip. The overage is at most 1 paisa times the number of people, which is negligible.
 
The alternative, distributing the remainder so one person pays a slightly different amount, requires knowing which person gets the extra paisa. In an app with no concept of individual identities, that is not meaningful. Round up is simpler and correct.
 