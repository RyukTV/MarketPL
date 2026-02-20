## Nexamarket

Marketplace local (MVP para el primer parcial): **menú funcional + UI con datos mock**.

### Estructura añadida

```text
app/
  page.tsx                  # Home (UI mock)
  sell/page.tsx             # Placeholder
  my-listings/page.tsx      # Placeholder
  profile/page.tsx          # Placeholder
  listing/[id]/page.tsx     # Detalle (demo)
components/
  shared/Navbar.tsx         # Menú
  shared/icons.tsx          # Íconos (SVG, sin dependencias extra)
  marketplace/*             # UI mock (cards, modal, filtros)
lib/mockProducts.ts         # Datos mock
```

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
---

## Conectar Supabase (Auth + Profiles) (MVP)

### 1) Crear `.env.local`
En la raíz del proyecto, crea un archivo **`.env.local`** con:

```bash
NEXT_PUBLIC_SUPABASE_URL=TU_URL_DE_SUPABASE
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY
NEXT_PUBLIC_APP_NAME=Nexamarket
```

> No subas `.env.local` a GitHub (ya está en `.gitignore`).

### 2) Crear la tabla `profiles` en Supabase
En Supabase: **SQL Editor → New query**, pega y ejecuta:

- `supabase/schema_mvp.sql`

Esto crea `public.profiles` + RLS (permisos).

### 3) Probar
1. Corre el proyecto: `npm install` y `npm run dev`
2. Entra a: `/auth` y crea cuenta
3. Ve a: `/profile` y completa tus datos (nombre, WhatsApp, ciudad)

