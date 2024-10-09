# Subs - Simplistic Open Source Subscription Cost Tracker

![CleanShot 2024-10-09 at 20 00 27](https://github.com/user-attachments/assets/ffb88333-6c4d-46c9-9ca7-49602106e5f1)

## Introduction

Hey everyone! Following the feedback from my [previous post](https://www.reddit.com/r/selfhosted/comments/1fvqrlr/i_made_a_simple_selfhosted_subscriptions_costs/), I'm excited to announce that Subs Tracker is now open-source and hosted on my own website. You can check out the demo here: [subs.ajnart.fr](https://subs.ajnart.fr)

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

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Copy the example env var file with `copy .env.example .env`
    1. Optional: Update the SQLLite database file setting in `.env`
4. Run the development server with `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Contributing

We welcome contributions! Feel free to submit issues or pull requests if you have ideas for improvements or have found any bugs.

## License

This project is open-source and available under the MIT License.

---

Thank you for your interest and support! We hope Subs Tracker helps you keep better track of your subscription costs. Happy tracking!
