## React Components Reference

Documenting public components in `frontend/app` used by the Next.js application.

Conventions:
- All components are client components (`"use client"`) unless otherwise noted.
- Props are listed with types. Example snippets assume usage within Next.js pages.

### ThemeProvider (`frontend/app/components/ThemeProvider.tsx`)

Props:
- `children: React.ReactNode`

Usage:
```tsx
import { ThemeProvider } from '@/app/components/ThemeProvider';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
```

Also exports `TOYOTA_THEME` constants for colors, fonts, spacing, and radii.

### Dashboard (`frontend/app/components/Dashboard.tsx`)

Props:
- `user: { id: string; name: string; email: string; role: 'admin' | 'user' } | null`
- `onLogout: () => void`

Usage:
```tsx
import Dashboard from '@/app/components/Dashboard';

<Dashboard user={user} onLogout={() => {/* sign out */}} />
```

### AdminHeader (`frontend/app/admin/components/AdminHeader.tsx`)

Props:
- `user: { id: string; name: string; email: string; role: 'admin' | 'user' } | null`
- `onLogout: () => void`

Usage:
```tsx
import AdminHeader from '@/app/admin/components/AdminHeader';

<AdminHeader user={user} onLogout={() => {/* sign out */}} />
```

### UserHeader (`frontend/app/user/components/UserHeader.tsx`)

Props:
- `user: { id: string; name: string; email: string; role: 'admin' | 'user' } | null`
- `onLogout: () => void`

Usage:
```tsx
import UserHeader from '@/app/user/components/UserHeader';

<UserHeader user={user} onLogout={() => {/* sign out */}} />
```

### Bay Management Components

All live under `frontend/app/admin/bays/components` and are modal/dialog UI helpers.

#### AddBayModal
Props:
- `isOpen: boolean`
- `onClose: () => void`
- `onSuccess: () => void`

Usage:
```tsx
import AddBayModal from '@/app/admin/bays/components/AddBayModal';

<AddBayModal isOpen={isOpen} onClose={close} onSuccess={refresh} />
```

#### EditBayModal
Props:
- `isOpen: boolean`
- `onClose: () => void`
- `onSuccess: () => void`
- `bay: Bay | null` where `Bay` is from `@/lib/api/bays`

Usage:
```tsx
import EditBayModal from '@/app/admin/bays/components/EditBayModal';
import type { Bay } from '@/lib/api/bays';

<EditBayModal isOpen={isOpen} onClose={close} onSuccess={refresh} bay={selectedBay as Bay} />
```

#### DeleteBayDialog
Props:
- `isOpen: boolean`
- `onClose: () => void`
- `onSuccess: () => void`
- `bay: Bay | null`

Usage:
```tsx
import DeleteBayDialog from '@/app/admin/bays/components/DeleteBayDialog';

<DeleteBayDialog isOpen={isOpen} onClose={close} onSuccess={refresh} bay={selectedBay} />
```

### Technician Management Components

Path: `frontend/app/admin/technicians/components`

#### AddTechnicianModal
Props:
- `isOpen: boolean`
- `onClose: () => void`
- `onSuccess: () => void`

#### EditTechnicianModal
Props:
- `isOpen: boolean`
- `onClose: () => void`
- `onSuccess: () => void`
- `technician: Technician | null` (from `@/lib/api/technicians`)

#### DeleteTechnicianDialog
Props:
- `isOpen: boolean`
- `onClose: () => void`
- `onSuccess: () => void`
- `technician: Technician | null`

Usage example:
```tsx
import AddTechnicianModal from '@/app/admin/technicians/components/AddTechnicianModal';
import EditTechnicianModal from '@/app/admin/technicians/components/EditTechnicianModal';
import DeleteTechnicianDialog from '@/app/admin/technicians/components/DeleteTechnicianDialog';

<AddTechnicianModal isOpen={isOpen} onClose={close} onSuccess={refresh} />
```

### Service Advisor Management Components

Path: `frontend/app/admin/service-advisors/components`

#### AddServiceAdvisorModal
Props:
- `isOpen: boolean`
- `onClose: () => void`
- `onSuccess: () => void`

#### EditServiceAdvisorModal
Props:
- `isOpen: boolean`
- `onClose: () => void`
- `onSuccess: () => void`
- `serviceAdvisor: ServiceAdvisor | null` (from `@/lib/api/service-advisors`)

#### DeleteServiceAdvisorDialog
Props:
- `isOpen: boolean`
- `onClose: () => void`
- `onSuccess: () => void`
- `serviceAdvisor: ServiceAdvisor | null`

Usage example:
```tsx
import EditServiceAdvisorModal from '@/app/admin/service-advisors/components/EditServiceAdvisorModal';

<EditServiceAdvisorModal isOpen={isOpen} onClose={close} onSuccess={refresh} serviceAdvisor={selected} />
```

### Pages

Top-level pages under `frontend/app` (`/login`, `/register`, `/admin`, `/user`, etc.) are route components for Next.js and not designed as reusable components. They orchestrate state via the API clients and compose the above UI components.

