# Umesh Lawate Portfolio

A responsive React + Vite portfolio with a fixed, mobile-ready navigation bar, animated section reveals, four editable live-project slots, an AI profile assistant, and a contact form.

## Run locally

```sh
npm install
npm run dev
```

## Add your four live projects

Edit `src/data/portfolio-content.ts`. Update the four entries in `projects` with your real project title, a short description, live URL and technology tags. The site intentionally shows no link until a URL is supplied.

## Profile and résumé

Your name, profile links, skills, work experience and contact details are in `src/data/portfolio-content.ts`. The original upload did not include the résumé PDF or project screenshots. Add a résumé as `public/resume/Umesh-Lawate-Resume.pdf` and update the résumé button destination in `src/PortfolioSite.tsx` when it is ready.

## AI assistant and contact form

The original `/api/chat` and `/api/contact` service integrations are included. Use `npx vercel dev` to run with the Vercel server functions and set the environment variables in the deployment dashboard (never in browser code):

- `ANTHROPIC_API_KEY` and optional `ANTHROPIC_MODEL` for the assistant
- `RESEND_API_KEY`, `CONTACT_TO_EMAIL` and `CONTACT_FROM_EMAIL` for delivered contact messages

Without the AI service the assistant falls back to portfolio-based answers. The contact form needs the email service to deliver a message.

## Build and deploy

```sh
npm run build
```

Deploy with a hosting platform that supports the included Vercel-compatible `/api` functions.
