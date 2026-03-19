# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


To create app using vite: 
npm create vite@latest my-react-app

To run: npm run dev



Install Backend Dependencies
mkdir backend
cd backend
npm init -y
npm install express mongoose bcryptjs cors dotenv


express → web framework

mongoose → MongoDB ORM

bcryptjs → password hashing

cors → allow frontend to talk to backend

dotenv → manage environment variables


To install Tailwind CSS v3.4.18 in your React project, follow these exact steps 👇

🧩 1. Install Tailwind and dependencies

Run this command in your project root:

npm install -D tailwindcss@^3.4.18 postcss autoprefixer


The -D flag means these are devDependencies — tools needed at build time.

⚙️ 2. Initialize Tailwind config files

Generate the default config files:

npx tailwindcss init -p


That creates:

tailwind.config.js
postcss.config.js

🛠️ 3. Configure template paths

Open tailwind.config.js and make sure the content section includes your React files:

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

🎨 4. Add Tailwind to your CSS

In your main CSS file (for example, src/index.css), add these three lines at the very top:

@tailwind base;
@tailwind components;
@tailwind utilities;

🚀 5. Start your development server

Run your React app:

npm run dev