# ModiTrack: NIMC Modification Management Dashboard

[cloudflarebutton]

ModiTrack is a sophisticated, secure, and intuitive internal web dashboard designed for the National Identity Management Commission (NIMC) to streamline the management of citizen data modification requests. The platform provides a centralized system for NIMC staff and administrators to view, track, assign, and process requests such as changes to name, date of birth, address, and phone number. It features role-based access control for Admins and Staff, a comprehensive dashboard with real-time analytics, advanced filtering, and a detailed request view. The system is built for efficiency and accountability, incorporating activity logs and an audit trail to ensure transparency in all operations. The user interface is designed to be professional, clean, and data-focused, reflecting the gravity of its purpose while ensuring a seamless and productive user experience.

## Key Features

-   **Role-Based Access Control:** Distinct interfaces and permissions for `Admin` and `Staff` roles.
-   **Analytics Dashboard:** At-a-glance view of key metrics like Total, Pending, and Completed requests.
-   **Comprehensive Data Table:** A filterable and sortable table of all modification requests with essential details.
-   **Advanced Filtering:** Easily filter requests by status, type, date range, or assigned staff.
-   **Detailed Request View:** A dedicated page for each request showing all details, history, and attached documents.
-   **User Management:** Admins can add, suspend, and manage staff accounts.
-   **Professional UI:** A clean, responsive, and data-focused design inspired by NIMC branding.

## Technology Stack

-   **Frontend:**
    -   React & Vite
    -   TypeScript
    -   React Router for navigation
    -   Tailwind CSS for styling
    -   shadcn/ui for the component library
    -   Zustand for state management
    -   TanStack Table for data grids
    -   Recharts for data visualization
    -   Framer Motion for animations
-   **Backend:**
    -   Hono running on Cloudflare Workers
-   **Storage:**
    -   Cloudflare Durable Objects for persistent, stateful storage.
-   **Deployment:**
    -   Cloudflare Pages & Workers

## Project Structure

The project is organized into three main directories:

-   `src/`: Contains the entire frontend React application, including pages, components, hooks, and utility functions.
-   `worker/`: Contains the Hono backend application that runs on a Cloudflare Worker. This is where API routes and business logic reside.
-   `shared/`: Contains TypeScript types and mock data that are shared between the frontend and the backend to ensure type safety.

## Getting Started

Follow these instructions to get the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later)
-   [Bun](https://bun.sh/) package manager
-   [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd moditrack_nimc_dashboard
    ```

2.  **Install dependencies:**
    This project uses `bun` for package management.
    ```bash
    bun install
    ```

### Running in Development Mode

To start the local development server, which includes both the Vite frontend and the Wrangler dev server for the worker, run:

```bash
bun dev
```

This will start the application, typically on `http://localhost:3000`. The frontend will automatically proxy API requests to the local worker instance.

## Deployment

This application is designed to be deployed seamlessly to the Cloudflare ecosystem.

1.  **Login to Wrangler:**
    Authenticate the Wrangler CLI with your Cloudflare account.
    ```bash
    wrangler login
    ```

2.  **Deploy the application:**
    Run the deploy script, which will build the application and deploy it to your Cloudflare account.
    ```bash
    bun deploy
    ```

Wrangler will handle the process of uploading the frontend assets to Cloudflare Pages and the backend code to Cloudflare Workers.

Alternatively, you can deploy directly from your GitHub repository using the button below.

[cloudflarebutton]

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.