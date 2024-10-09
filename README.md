# Subs - Simplistic Open Source Subscription Cost Tracker

## This repo is a little special 
> [!NOTE]
> I am building my own coding assistant extension called [kodu.ai](https://www.kodu.ai/l/extension-coder), the goal is to help people build their ideas with little to no preivous coding experience. This repository comes from an idea I have had in the back of my mind for a while, I built it in less than 2 hours using Kodu and it has helped me improve the extension. I thought the idea was nice so I shared it and a lot of you liked it, so I decided to open-soure the code.

I'd **love** for this repo to be a collaborative effort between enthousiasts of the self-hosted community, my goal with Kodu is to enable anyone to make modifications and improvements to tools they use on a daily basis. If you would like to try to improve this repository by using an LLM/Code assistant feel free to do so, I have a lot to learn from testimonials. If you have some spare time and want to give it a try, visit the [ai-tagged issues](https://github.com/ajnart/subs/issues?q=sort%3Aupdated-desc+is%3Aissue+is%3Aopen+label%3Aai) . They are issues that could be added by anyone, even someone with 0 coding experience. 


## Introduction

Hey everyone! Following the feedback from my [previous post](https://www.reddit.com/r/selfhosted/comments/1fvqrlr/i_made_a_simple_selfhosted_subscriptions_costs/), I'm excited to announce that Subs Tracker is now open-source and hosted on my own website. 

### Demo
You can check out the demo here: [subs.ajnart.fr](https://subs.ajnart.fr)

## What's New?

- **Improved UI/UX**: We've given the app a facelift, making it more visually appealing and user-friendly.
- **Client-Side Data Storage**: Your data is now stored directly in your browser, eliminating the need for self-hosting.
- **Edit Functionality**: You can now easily edit your existing subscriptions.

## Features

- Add, edit, and remove subscriptions
- Automatic favicon fetching for easy visual identification
- Total monthly cost calculation
- Responsive design for both desktop and mobile use

## Tech Stack

For those curious about the technology behind Subs Tracker:

- **Frontend Framework**: Next.js and React
- **UI Components**: Shadcn UI
- **State Management**: Zustand
- **Development Tools**: GitHub Copilot and Kodu AI code extension

## Docker setup 
> [!NOTE]
> Docker setup work in progress at the moment. Feel free to contribute to the project and help me finish it.

## Development Setup / Installation

1. Clone the repository
2. Install dependencies with `pnpm i` (install it [here](https://pnpm.io/cli/install))
3. Copy the example env var file with `copy .env.example .env`
    1. Optional: Update the SQLLite database file setting in `.env`
		2. Optional: Set `NEXT_PUBLIC_USE_SQLITE` to `false` to use localstorage instead of SQLLite (will persist data in the browser)
4. Push the database schema with `pnpm run db:push` (not needed if you are using localstorage)
4. Run the development server with `pnpm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Demo GIF

![CleanShot 2024-10-09 at 20 00 27](https://github.com/user-attachments/assets/ffb88333-6c4d-46c9-9ca7-49602106e5f1)

## License

This project is open-source and available under the MIT License.

---

Thank you for your interest and support! We hope Subs Tracker helps you keep better track of your subscription costs. Happy tracking!
