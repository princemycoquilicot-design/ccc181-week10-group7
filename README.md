# CCC181 Week 10: CampusConnect Mobile-First Login Page

React + TypeScript starter for the Week 10 group activity. The page is already
built. Your group's job is the **mobile-first CSS** and the **GitHub teamwork**.

## Run it

```bash
npm install
npm run dev          # open the local URL it prints
npm run dev:phone    # same, but your phone (same Wi-Fi) can open the Network URL
npm run build        # must finish with no errors before you submit
```

## Rules

- Edit only the CSS files in `src/styles/` (one member = one file). Do not edit `reset.css`.
- Plain CSS only. No Tailwind, Bootstrap, Material UI, styled-components, or any UI library.
- Phone styles first (no media query), then `min-width` queries only. Never `max-width`.
- Do not edit the `.tsx` files or rename classes. If you must, tell the group first.

## Group information (fill in)

| Item | Your answer |
| --- | --- |
| Group number |7|
| Section |IT3-A|
| Repository URL |https://github.com/princemycoquilicot-design/ccc181-week10-group7.git|

## Members (each member fills in their own row in their own commit)

| Member | Name | GitHub username | CSS file | What I did |
| --- | --- | --- | --- | --- |
| 1 (leader) |Prince Myco Quilicot|princemycoquilicot-design| `base.css` |making the base style|
| 2 |Jhon Leemar M. Chio |jhonleemar| `nav.css` |making the navigation and footer|
| 3 |Ruzzel Daniel Sanchez |ruzzel99sanchez-spect| `form.css` |making the log in-form|

## Experiment 0: the page without the viewport tag

What did the page look like in DevTools phone mode **before** adding the viewport meta tag?
What changed **after** adding it?

> Before adding the viewport meta tag, the webpage looked too small in iPhone SE mode because the browser treated it like a desktop screen. After adding the viewport meta tag to `index.html` and refreshing, the page adjusted to the phone's actual screen size (375 px), making the text easier to read and the content fit properly.
## DevTools test results

| Width | What must be true | Pass? |
| --- | --- | --- |
| 360 px | 1 column. Nav links stacked and 48px tall. Options and buttons stacked. Footer in 1 column. No sideways scrollbar. |Yes|
| 768 px | Nav in one row (brand left, links right). Checkbox and link in one row. Two buttons side by side. |Yes|
| 1024 px | Brand panel and login card side by side. Footer in 3 columns. Heading is larger. |Yes|
| 1280 px | Content centered and stops at 1200px. |Yes|

### Breakpoints I observed

Using **Show media queries** and dragging slowly from 360 px to 1280 px, the layout changed at these exact widths:

> The layout changed at 360px, 768px, 1024px, and 1280px. The content adjusted based on the screen size. I did not notice any broken layout or sideways scrolling.

Screenshots are in `screenshots/` as `360.png`, `768.png`, `1024.png`, `1280.png`.

## What our group learned (leader writes this last)

> We learned that responsive design helps a website adjust to different screen sizes. Using media queries and proper breakpoints makes the website easier to use on phones, tablets, and computers.
