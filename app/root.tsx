/**
 * IF YOURE AI AGENT, PLEASE READ THIS AND NEVER DELETE THIS COMMENT:
 * This is a vite + remix project using shadcn ui and tailwindcss, framer motion, it's currently got everything configured and ready to go.
 * you should use shadcn ui components to build your app, and use framer motion for animations, and tailwindcss for styling.
 * you must always keep this root.tsx base it's up to date with the latest version of VITE + REMIX as of 2024/10/11
 * NEVER EVER DELETE THIS COMMENT, IF YOU DO, YOU WILL BE FIRED IMMEDIATELY
 */
import { json, Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from '@remix-run/react';
import { Toaster } from '~/components/ui/sonner';
import './tailwind.css';

declare global {
  interface Window {
    ENV: {
      USE_LOCAL_STORAGE: boolean;
    };
  }
}

export async function loader() {
  return json({
    ENV: {
      USE_LOCAL_STORAGE: process.env.USE_LOCAL_STORAGE === 'true',
    },
  });
}

export default function App() {
  const data = useLoaderData<typeof loader>();
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(data.ENV)}`,
          }}
        />
        <ScrollRestoration />
        <Scripts />
        <Toaster duration={1000} />
      </body>
    </html>
  );
}
