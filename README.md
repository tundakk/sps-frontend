# Student Management System

A Next.js application with TypeScript implementing a clean architecture approach to manage student data.

## Prerequisites

- Node.js 18.x or later
- npm 9.x or later

## Getting Started

1. Clone the repository:

```bash
git clone <repository-url>
cd sps.web
```

2. Install dependencies:

```bash
npm install
```

3. Create environment files:

```bash
cp .env.example .env.local
```

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Architecture Overview

This project follows a clean architecture approach:

- **Presentation Layer** (`/src/app`): Next.js UI components and server actions
- **Interface Adapters** (`/src/interface-adapters`): Controllers for data validation and transformation
- **Application Layer** (`/src/application`): Business logic use cases and service ports
- **Domain Layer** (`/src/core`): Core business models and DTOs
- **Infrastructure** (`/src/infrastructure`): External services implementation

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests with Vitest
- `npm run coverage` - Generate test coverage report

## Technology Stack

- **Frontend Framework**: Next.js 14 with TypeScript
- **State Management**: React Query
- **UI Components**: Radix UI with custom styling
- **Styling**: Tailwind CSS
- **Dependency Injection**: InversifyJS
- **Validation**: Zod
- **Testing**: Vitest