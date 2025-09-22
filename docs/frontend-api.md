## Frontend API Clients and Auth

This document covers the public TypeScript APIs exposed in `frontend/lib` used by the Next.js app.

Environment:
- `NEXT_PUBLIC_API_URL` sets the backend base URL. Defaults to `http://localhost:8080`.

### Auth (`frontend/lib/auth.ts`)

Exports:
- `tokenManager`
  - `getToken(): string | null`
  - `setToken(token: string): void`
  - `removeToken(): void`
  - `isAuthenticated(): boolean`

- `authAPI`
  - `login(credentials: LoginCredentials): Promise<AuthResponse>`
  - `register(userData: RegisterData): Promise<AuthResponse>`
  - `logout(): void`
  - `getCurrentUser(): Promise<AuthResponse>`

- `validators`
  - `email(email: string): string | null`
  - `password(password: string): string | null`
  - `name(name: string): string | null`
  - `confirmPassword(password: string, confirmPassword: string): string | null`

- `navigation`
  - `redirectToDashboard(role?: 'admin' | 'user'): void`
  - `redirectToLogin(): void`
  - `requireAuth(): boolean`
  - `requireRole(requiredRole: 'admin' | 'user'): boolean`

Types:
```ts
interface LoginCredentials { email: string; password: string }
interface RegisterData { name: string; email: string; password: string }
interface AuthResponse {
  success: boolean;
  token?: string;
  message?: string;
  user?: { id: string; name: string; email: string; role: 'admin' | 'user' };
}
```

Usage example:
```ts
import { authAPI, tokenManager } from '@/lib/auth';

const res = await authAPI.login({ email: 'admin@example.com', password: 'secret' });
if (res.success && res.token) {
  tokenManager.setToken(res.token);
}
```

### Bays Client (`frontend/lib/api/bays.ts`)

Exports:
- `bayAPI`
  - `getAllBays(): Promise<ApiResponse<Bay[]>>` (mocked)
  - `getBayById(bayId: string): Promise<ApiResponse<Bay>>`
  - `createBay(data: CreateBayData): Promise<ApiResponse<Bay>>`
  - `updateBay(bayId: string, data: UpdateBayData): Promise<ApiResponse<Bay>>`
  - `deleteBay(bayId: string): Promise<ApiResponse<void>>`

- `bayValidators`
  - `bayName(name: string): string | null`
  - `bayNo(bayNo: string): string | null`
  - `bayStatus(status: string): string | null`

- `bayUtils`
  - `formatStatus(status: 'active' | 'inactive'): { text: string; className: string }`
  - `sortBays(bays: Bay[]): Bay[]`
  - `filterBaysByStatus(bays: Bay[], status: 'active' | 'inactive' | 'all'): Bay[]`
  - `searchBays(bays: Bay[], query: string): Bay[]`

Types:
```ts
interface Bay { bay_id: string; bay_name: string; bay_no: string; bay_status: 'active' | 'inactive' }
interface CreateBayData { bay_name: string; bay_no: string; bay_status: 'active' | 'inactive' }
interface UpdateBayData { bay_name: string; bay_no: string; bay_status: 'active' | 'inactive' }
interface ApiResponse<T> { success: boolean; data?: T; message?: string }
```

Usage example:
```ts
import { bayAPI } from '@/lib/api/bays';
const res = await bayAPI.createBay({ bay_name: 'Bay A', bay_no: 'A001', bay_status: 'active' });
if (res.success) console.log(res.data);
```

### Technicians Client (`frontend/lib/api/technicians.ts`)

Exports:
- `technicianAPI`
  - `getAllTechnicians(): Promise<ApiResponse<Technician[]>>` (mocked)
  - `getTechnicianById(id: string): Promise<ApiResponse<Technician>>`
  - `createTechnician(data: CreateTechnicianData): Promise<ApiResponse<Technician>>`
  - `updateTechnician(id: string, data: UpdateTechnicianData): Promise<ApiResponse<Technician>>`
  - `deleteTechnician(id: string): Promise<ApiResponse<void>>`

- `technicianValidators`
  - `technicianName(name: string): string | null`
  - `technicianStatus(status: string): string | null`

- `technicianUtils`
  - `sortTechnicians(technicians: Technician[]): Technician[]`
  - `filterByStatus(technicians: Technician[], status: 'active' | 'inactive'): Technician[]`
  - `searchTechnicians(technicians: Technician[], query: string): Technician[]`
  - `formatStatus(status: string): { text: string; className: string }`
  - `getStatistics(technicians: Technician[]): { total:number; active:number; inactive:number; activePercentage:number }`

Types:
```ts
interface Technician { technician_id: string; technician_name: string; technician_status: 'active' | 'inactive'; created_at?: string; updated_at?: string }
interface CreateTechnicianData { technician_name: string; technician_status: 'active' | 'inactive' }
interface UpdateTechnicianData { technician_name: string; technician_status: 'active' | 'inactive' }
interface ApiResponse<T> { success: boolean; data?: T; message?: string; error?: string }
```

Usage example:
```ts
import { technicianAPI } from '@/lib/api/technicians';
const res = await technicianAPI.updateTechnician('tech-001', { technician_name: 'John', technician_status: 'active' });
```

### Service Advisors Client (`frontend/lib/api/service-advisors.ts`)

Exports:
- `serviceAdvisorAPI`
  - `getAllServiceAdvisors(): Promise<ApiResponse<ServiceAdvisor[]>>` (mocked)
  - `getServiceAdvisorById(id: string): Promise<ApiResponse<ServiceAdvisor>>`
  - `createServiceAdvisor(data: CreateServiceAdvisorData): Promise<ApiResponse<ServiceAdvisor>>`
  - `updateServiceAdvisor(id: string, data: UpdateServiceAdvisorData): Promise<ApiResponse<ServiceAdvisor>>`
  - `deleteServiceAdvisor(id: string): Promise<ApiResponse<void>>`

- `serviceAdvisorValidators`
  - `name(name: string): string | null`
  - `status(status: string): string | null`

- `serviceAdvisorUtils`
  - `sortServiceAdvisors(serviceAdvisors: ServiceAdvisor[]): ServiceAdvisor[]`
  - `filterByStatus(serviceAdvisors: ServiceAdvisor[], status: 'active' | 'inactive'): ServiceAdvisor[]`
  - `searchServiceAdvisors(serviceAdvisors: ServiceAdvisor[], query: string): ServiceAdvisor[]`
  - `formatStatus(status: string): { text: string; className: string }`
  - `getStatistics(serviceAdvisors: ServiceAdvisor[]): { total:number; active:number; inactive:number; activePercentage:number }`

Types:
```ts
interface ServiceAdvisor { service_advisor_id: string; name: string; status: 'active' | 'inactive'; created_at?: string; updated_at?: string }
interface CreateServiceAdvisorData { name: string; status: 'active' | 'inactive' }
interface UpdateServiceAdvisorData { name: string; status: 'active' | 'inactive' }
interface ApiResponse<T> { success: boolean; data?: T; message?: string; error?: string }
```

Usage example:
```ts
import { serviceAdvisorAPI } from '@/lib/api/service-advisors';
await serviceAdvisorAPI.deleteServiceAdvisor('sa-001');
```

