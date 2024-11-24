.
├── .env.example
├── .github
│   ├── challenge.md
│   ├── chat-engineering-requirements-diagram.md
│   ├── chat-products-requirements-diagram.md
│   ├── current-file-structure.md
│   ├── engineering-requirements-document.md
│   ├── entity-relationship-diagram.md
│   ├── gemini-document-processing.md
│   ├── images
│   │   ├── 1. High-Level Architecture Diagram.png
│   │   ├── 2. System Context Diagram.png
│   │   ├── 3. Invoice Processing Sequence Diagrams.png
│   │   └── 4. Data Synchronization Sequence.png
│   └── vision-nodejs.md
├── .gitignore
├── README.md
├── bun.lockb
├── components.json
├── eslint.json
├── next.config.js
├── package.json
├── postcss.config.js
├── prettier.config.js
├── prisma
│   └── schema.prisma
├── public
│   ├── favicon.ico
│   └── uploads
├── src
│   ├── app
│   │   ├── \_components
│   │   │   └── post.tsx
│   │   ├── api
│   │   │   ├── auth
│   │   │   │   └── [...nextauth]
│   │   │   │   └── route.ts
│   │   │   ├── files
│   │   │   │   ├── delete-files
│   │   │   │   │   └── route.ts
│   │   │   │   ├── get-files
│   │   │   │   │   └── route.ts
│   │   │   │   └── post-files
│   │   │   │   └── route.ts
│   │   │   ├── generate
│   │   │   │   └── pdf-generate
│   │   │   │   └── route.ts
│   │   │   └── trpc
│   │   │   └── [trpc]
│   │   │   └── route.ts
│   │   ├── data-views
│   │   │   ├── customers
│   │   │   │   ├── \_components
│   │   │   │   │   ├── columns.tsx
│   │   │   │   │   └── edit-customer-dialog.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── invoices
│   │   │   │   ├── \_components
│   │   │   │   │   ├── columns.tsx
│   │   │   │   │   └── edit-invoice-dialog.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── page.tsx
│   │   │   └── products
│   │   │   ├── \_components
│   │   │   │   ├── columns.tsx
│   │   │   │   └── edit-product-dialog.tsx
│   │   │   └── page.tsx
│   │   ├── file-management
│   │   │   ├── \_components
│   │   │   │   ├── file-list.tsx
│   │   │   │   └── file-upload-demo.tsx
│   │   │   ├── file-upload
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── temp
│   │   ├── page.tsx
│   │   └── zustand
│   │   └── page.tsx
│   ├── components
│   │   ├── dashboard
│   │   │   ├── app-sidebar.tsx
│   │   │   ├── dashboard-breadcrumbs.tsx
│   │   │   ├── dashboard-sidebar-menu-section.tsx
│   │   │   └── dashboard.tsx
│   │   ├── data-table
│   │   │   ├── data-table-cell-editable.tsx
│   │   │   ├── data-table-column-header.tsx
│   │   │   ├── data-table-pagination.tsx
│   │   │   ├── data-table-toolbar.tsx
│   │   │   ├── data-table-view-option.tsx
│   │   │   └── data-table.tsx
│   │   ├── demo
│   │   │   └── sonner-demo.tsx
│   │   ├── json-display.tsx
│   │   ├── providers.tsx
│   │   └── ui
│   │   ├── alert-dialog.tsx
│   │   ├── badge.tsx
│   │   ├── breadcrumb.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── collapsible.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── scroll-area.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── sheet.tsx
│   │   ├── sidebar.tsx
│   │   ├── skeleton.tsx
│   │   ├── sonner.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   └── tooltip.tsx
│   ├── env.js
│   ├── hooks
│   │   └── use-mobile.tsx
│   ├── lib
│   │   ├── constants
│   │   │   └── extraction-prompt.ts
│   │   ├── types
│   │   │   └── supported-files.ts
│   │   ├── utils.ts
│   │   └── validations
│   │   ├── file.ts
│   │   └── pdf-generate.ts
│   ├── server
│   │   ├── api
│   │   │   ├── root.ts
│   │   │   ├── routers
│   │   │   │   └── post.ts
│   │   │   └── trpc.ts
│   │   ├── auth
│   │   │   ├── config.ts
│   │   │   └── index.ts
│   │   └── db.ts
│   ├── stores
│   │   ├── useDataStore.ts
│   │   └── useUploadStore.ts
│   ├── styles
│   │   └── globals.css
│   ├── trpc
│   │   ├── query-client.ts
│   │   ├── react.tsx
│   │   └── server.ts
│   └── types
│   └── table.ts
├── start-database.sh
├── tailwind.config.ts
└── tsconfig.json

50 directories, 106 files
