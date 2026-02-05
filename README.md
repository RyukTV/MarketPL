# Nexamarket

Marketplace local (MVP para el primer parcial): **menú funcional + UI con datos mock (sin Supabase todavía)**.

## Requisitos (antes de empezar)
- **Node.js LTS** instalado.
- **VS Code** (recomendado).
- **GIT BASH** (recomendado).

> Si un compañero no tiene Node: instálenlo y luego verifiquen con:
> ```bash
> node -v
> npm -v
> ```

## Cómo levantar el proyecto (paso a paso)
1) Abrir la carpeta del proyecto en VS Code  
2) Instalar dependencias(Si tienen problemas de ejecucion recomiendo quitar el node_module):
```bash
npm install
```

3) Ejecutar en modo desarrollo:
```bash
npm run dev
```

4) Abrir en el navegador:
- http://localhost:3000

## Comandos útiles (los que más se usan)
- Correr el proyecto:
```bash
npm run dev
```

- Compilar para producción (para revisar que todo está bien):
```bash
npm run build
```

- Levantar compilado (producción local):
```bash
npm run start
```

- Revisar estilo/errores (si está configurado eslint):
```bash
npm run lint
```

## Qué tiene el MVP ahora mismo
- Navbar (menú): **Inicio / Publicar / Mis publicaciones / Perfil**
- Home con UI de marketplace (productos mock)
- Rutas placeholder (páginas vacías por ahora)

## Estructura del proyecto (para ubicarse rápido)
```text
app/
  layout.tsx                 # Layout global (envuelve toda la app)
  page.tsx                   # Home (usa HomeClient)
  sell/page.tsx              # Publicar (placeholder)
  my-listings/page.tsx       # Mis publicaciones (placeholder)
  profile/page.tsx           # Perfil (placeholder)
  listing/[id]/page.tsx      # Detalle (demo)

components/
  shared/
    Navbar.tsx               # Menú superior
    icons.tsx                # Íconos SVG usados en el home
  marketplace/
    HomeClient.tsx           # Home (buscador, filtros, grid, modal)
    CategoryFilter.tsx       # Filtro por categorías
    ProductCard.tsx          # Tarjeta de producto
    ProductModal.tsx         # Modal de detalle

lib/
  mockProducts.ts            # Productos/categorías de prueba (mock)
```

## Cómo trabajar en equipo (Git / GitHub) - simple
**Regla:** nadie sube directo a `main`. Todo entra por Pull Request (PR).

1) Crear una rama para tu trabajo:
```bash
git checkout -b feature/nombre-corto
```

2) Guardar cambios:
```bash
git add .
git commit -m "Describe tu cambio"
```

3) Subir tu rama:
```bash
git push -u origin feature/nombre-corto
```

4) En GitHub: abrir un **Pull Request** hacia `main` y pedir revisión.

## Nota para el siguiente paso (después del parcial)
Después del primer parcial conectaremos Supabase:
- Auth (registro/login)
- Base de datos (Postgres)
- Storage (imágenes)
- RLS (seguridad por usuario)

---

## CRUD de Publicaciones (Crear / Ver / Editar / Eliminar)

Esta sección es para que el equipo implemente la parte de **Publicaciones** del marketplace:
- Crear publicación (producto)
- Ver publicaciones (feed + mis publicaciones)
- Editar publicación
- Eliminar publicación

> **Nota:** por ahora el proyecto funciona con **data mock** para el UI del parcial.
> Después del parcial conectaremos Supabase (BD + Auth + Storage).  
> Aun así, puedes avanzar el CRUD **desde ya** dejando la estructura lista.

### Rutas (pantallas) que ya existen o se usarán
- `app/page.tsx` → Home / Feed (ver publicaciones)
- `app/listing/[id]/page.tsx` → Detalle de publicación
- `app/sell/page.tsx` → Crear publicación (formulario)
- `app/my-listings/page.tsx` → Ver / Editar / Eliminar tus publicaciones

### Archivos recomendados para implementar el CRUD (organizado y sencillo)
Crea estas carpetas/archivos (si no existen):
- `features/listings/types.ts` → tipos de TypeScript
- `features/listings/mockStore.ts` → CRUD temporal en memoria (solo para desarrollo)
- `features/listings/services/listings.service.ts` → CRUD real (Supabase) **después del parcial**
- `features/listings/components/ListingForm.tsx` → formulario reutilizable
- `features/listings/components/ListingCard.tsx` → tarjeta de publicación reutilizable

### Paso 1 — Tipos (TypeScript)
En `features/listings/types.ts` define algo simple:
- `Listing` (id, title, description, price, city, category, images[], status, created_at, updated_at)

### Paso 2 — CRUD temporal (Mock Store) para avanzar sin Supabase
Crea `features/listings/mockStore.ts` con funciones:
- `getAllListings()`
- `getListingById(id)`
- `createListing(data)`
- `updateListing(id, data)`
- `deleteListing(id)`

📌 **Importante:** Este store es temporal, para que el UI funcione mientras llega Supabase.  
Cuando conectemos Supabase, reemplazamos la implementación pero dejamos la misma “API” (mismos nombres de funciones).

### Paso 3 — Crear publicación (pantalla /sell)
En `app/sell/page.tsx`:
1. Renderiza `ListingForm`
2. Al enviar (submit), llama a `createListing(...)`
3. Redirige a `/my-listings` o muestra un mensaje "Publicado".

### Paso 4 — Ver publicaciones (Home)
En `components/marketplace/HomeClient.tsx` o en el componente que use el feed:
1. Reemplaza el arreglo mock por `getAllListings()`
2. Filtra por `searchQuery` y `activeCategory`
3. Cada card debe enlazar a `/listing/[id]`

### Paso 5 — Mis publicaciones (ver/editar/eliminar)
En `app/my-listings/page.tsx`:
1. Listar publicaciones del usuario (por ahora se puede filtrar por `sellerId` fake o por “todas”)
2. Botón **Editar** → abre un formulario con datos precargados y llama `updateListing`
3. Botón **Eliminar** → confirma y llama `deleteListing`

---

## (Después del parcial) Conectar CRUD a Supabase (plan corto)

Cuando llegue el momento, el CRUD real irá en:
- `features/listings/services/listings.service.ts`

### Qué se hará en Supabase
1. Tablas: `profiles`, `categories`, `listings`, `listing_images`
2. Storage bucket: `listing-images`
3. RLS: 
   - lectura pública de `listings` con `status = 'active'`
   - escritura solo del dueño (`seller_id = auth.uid()`)

### Qué cambia en el código
- Mantienes las mismas funciones (`createListing`, `getAllListings`, etc.)
- Solo cambias la implementación interna: de `mockStore.ts` a `listings.service.ts` (Supabase)

Así el equipo no pierde trabajo: primero avanza UI + estructura, luego se enchufa Supabase.
