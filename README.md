# Roles & Permissions Matrix Editor

A Next.js application for managing role-based permissions through an interactive matrix interface.

## Features

- Interactive permissions matrix with roles as columns and permissions as rows
- Individual cell toggles for granular permission control
- Bulk row/column toggles with tri-state indicators
- Real-time filtering by permission name
- Optimistic updates with error rollback
- Sticky headers for better UX on large matrices
- Accessible keyboard navigation

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up your MongoDB connection in `.env`:
```
MONGODB_URL=your_mongodb_connection_string
```

3. Start the development server:
```bash
npm run dev
```

4. Seed the database with initial data:
```bash
npm run seed
```

5. Open [http://localhost:3000](http://localhost:3000) to view the application.

## API Endpoints

- `GET /api/roles` - Fetch all roles
- `GET /api/permissions` - Fetch all permissions  
- `GET /api/assignments` - Fetch all role-permission assignments
- `PATCH /api/assignments/toggle` - Toggle individual permission
- `PATCH /api/assignments/row` - Bulk toggle row (all permissions for a role)
- `PATCH /api/assignments/column` - Bulk toggle column (all roles for a permission)
- `POST /api/seed` - Seed database with initial data

## Usage

- Click individual cells to grant/revoke specific permissions
- Click role headers to toggle all permissions for that role
- Click permission headers to toggle that permission for all roles
- Use the filter input to search permissions by name
- Tri-state indicators show: ✓ (all), ◐ (partial), or empty (none)
