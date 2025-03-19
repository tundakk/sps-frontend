# Development Guidelines

## Stack
- **Frontend**: Next.js with TypeScript and pseudo clean architecture
- **Backend**: .NET Core Web API

## Terminal Commands
Use semicolon (`;`) for command separation instead of (`&&`)

```bash
# Correct
cd C:\Skole ; npm run dev

# Wrong
cd C:\Skole && npm run dev
```

## Frontend Architecture

### 1. Presentation Layer (`/src/app`)
- Next.js UI components
- Server actions as entry points
- Focused on rendering and user interactions

### 2. Interface Adapters (`/src/interface-adapters/controllers`)
- Controllers that validate input data
- Transform data between layers
- Handle errors at boundaries
- Connect UI to business logic

### 3. Application Layer (`/src/application`)
- Use cases that contain business logic (`/src/application/use-cases`)
- Ports (interfaces) that define service contracts (`/src/application/ports`)
- Independent of frameworks and UI concerns

### 4. Domain Layer (`/src/core`)
- **Models** (`/src/core/domain`):
  - Entities: Core business objects with identity
  - DTOs (`/src/core/dtos`): Data transfer objects for layer communication
  - Value Objects: Immutable objects representing domain concepts
  - Aggregates: Clusters of related domain objects
- Domain-specific validation with Zod schemas
- Error types and custom exceptions (`/src/core/errors`)
- Business rules and invariants

### 5. Infrastructure Layer (`/src/infrastructure`)
- Concrete service implementations (`/src/infrastructure/services`)
- External API communication
- Storage mechanisms (local storage)
- Logging (`/src/infrastructure/logging`)

### 6. Dependency Injection (`/src/di`)
- Container setup and management using Inversify (`/src/di/container.ts`)
- Type symbols for interface registration (`/src/di/types.ts`)
- Module organization for service registration (`/src/di/modules`)
- Factory functions for retrieving service instances
- Environment-aware service implementation selection (production vs testing)

## Backend Service Response Pattern

The .NET Core Web API uses a generic `ServiceResponse<T>` pattern, mirrored in our frontend at `/src/core/domain/service-response.model.ts`:

```typescript
export type ServiceResponse<T> = {
  data?: T | null;
  success: boolean;
  message: string;
  errorCode: string;
  validationErrors?: Record<string, string[]> | null;
  technicalDetails?: string | null;
};
```

### Available Factory Methods

```typescript
// Located at /src/core/domain/service-response.model.ts
export const ServiceResponseFactory = {
  createSuccess<T>(data: T): ServiceResponse<T>
  createError<T>(message: string, errorCode?: string): ServiceResponse<T>
  createValidationError<T>(validationErrors, message?): ServiceResponse<T>
  createNotFound<T>(message?): ServiceResponse<T>
}
```

Use these methods when communicating with the backend to ensure consistent response handling throughout the application.