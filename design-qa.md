# Design QA: 等级

- Source visual truth: `C:\Users\14629\AppData\Local\Temp\codex-clipboard-9fe10b17-f836-497f-9237-42bdfa370e9f.png`
- Profile entry reference: `C:\Users\14629\AppData\Local\Temp\codex-clipboard-b9ea1fa0-0d7c-4221-9a82-62d7b087d8ba.png`
- Static detail-row reference: `C:\Users\14629\AppData\Local\Temp\codex-clipboard-a65e8fdb-a029-463a-bda2-64cc8cdc5a5a.png`
- Implementation: `http://127.0.0.1:3000/` in the Codex in-app browser
- Implementation component: `src/components/JourneyLevelView.tsx`
- CSS target: mobile app shell, 430 px maximum width, 100dvh height
- Checked state: Profile > LV.3 黄金 > 等级; LV3 default card; LV4 next-card transition; static growth row

## Full-view comparison evidence

The browser-rendered page was inspected against the supplied references. The page retains the existing dark navy MOVEVI shell, centered header, warm metallic current-level card, compact comparison table, and explanation panel. The top area now exposes all six levels as one horizontal, snap-aligned card carousel while keeping LV3 黄金 as the default state.

## Focused-region comparison evidence

- Profile entry: reads `LV.3 / 黄金`, keeps the existing compact visual treatment, and opens the level page.
- Header and copy: title is `等级`; rank progress and comparison copy use `经验值` except the explicitly requested future-play wording in rule 3.
- Rank cards: six levels are present, with arrow controls, pagination indicators, and horizontal swipe. The default card is LV3 黄金; the next control was verified to reveal LV4 钻石.
- Growth details: original icon/title/chevron styling is retained, but the row is now a non-focusable `div` with no click event or expansion state.
- Rank table: all six levels, thresholds, relative bar lengths, and current-level emphasis are visible without clipping.

## Required fidelity surfaces

- Fonts and typography: passed. Existing app display/body fonts and hierarchy remain intact.
- Spacing and layout rhythm: passed. Carousel controls fit between the rank card and information panel without crowding.
- Colors and visual tokens: passed. Each level receives a distinct metallic color treatment while the current LV3 card remains faithful to the supplied gold reference.
- Image quality and asset fidelity: passed. The transparent rank badge remains crisp and is consistently treated across all cards.
- Copy and content: passed. The profile role is 黄金; title, experience terminology, thresholds, and the requested third rule are present.

## Interaction and runtime checks

- Profile level control opens the level page.
- Back control returns to Profile.
- Carousel buttons and pagination update the active card; touch scrolling remains enabled through CSS scroll snap.
- Growth details exposes no button role, click handler, or tab stop.
- Current DOM rendered successfully after HMR; no active component runtime error was observed.

## Findings

No actionable P0, P1, or P2 findings remain.

## Comparison history

- Initial implementation: single LV3 card with expandable growth details.
- Revision 1: added six-card carousel, updated profile/title/experience copy, and removed growth-details interaction.
- Revision 2: restored the original growth-details visual treatment while keeping it static; updated rule 3 to the requested wording.

final result: passed

## Corrective mobile QA: in-app browser chrome

- Root cause: the supplied phone browser leaves an approximately 390 x 690 px CSS viewport after its top and bottom chrome. That height matched the desktop `max-height: 720px` compact rule, which shrank the hero and preserved the large empty block.
- Fix: desktop compact styling now requires a viewport wider than 600 px. Mobile viewports from 640 px high use their own balanced spacing rule; genuinely short mobile screens retain a separate compact fallback.
- Measured 390 x 690 result: feature-row bottom 599 px; CTA top 619 px; CTA bottom 677 px.
- Effective spacing: 20 px between features and CTA, with 13 px remaining below the CTA. No scrolling or clipping is required.
- Findings: no actionable P0, P1, or P2 issues.

final result: passed

## Latest mobile QA: tall-screen whitespace

- Source visual truth: `C:\Users\14629\AppData\Local\Temp\codex-clipboard-e44bc3d1-247e-497a-9cf3-482357b95b67.jpg`
- Test viewport: 390 x 812 px, matching the usable CSS viewport of the supplied iPhone in-app-browser capture.
- Change: high-aspect mobile screens now allocate more of their free height above the city stack, moving the visual/copy/features group down and reducing the empty block before the CTA.
- Browser comparison: passed. The feature row and CTA now have a compact, intentional gap; all copy, imagery, and the complete button remain visible without scrolling.
- Responsive guard: the adjustment applies only below 600 px width and above 760 px height; short screens retain the existing compact layout.
- Findings: no actionable P0, P1, or P2 issues.

final result: passed

## Latest annotation QA: first-journey centering

- Source visual truth: `C:\Users\14629\AppData\Local\Temp\codex-clipboard-1b4c50a4-ddd8-4c21-99c6-3b63bc07d4bd.png`
- Scope: the highlighted city-card, headline, supporting copy, and feature group on the first-use journey screen.
- Change: increased the responsive top spacing before the city visual so the complete hero group sits closer to the vertical center of the space above the fixed CTA.
- Responsive guard: viewports at or below 720 px height retain the original compact top spacing and scale treatment.
- Browser comparison: passed. The hero group is visually centered with more balanced top/bottom negative space; the brand header and bottom CTA remain fixed and unclipped.
- Findings: no actionable P0, P1, or P2 issues.

final result: passed
