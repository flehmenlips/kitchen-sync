# High-Level Technical Architecture

This document outlines the proposed technical architecture for the KitchenSync system.

## Overview

KitchenSync is designed as a full-stack web application with a distinct separation between the frontend user interface and the backend server logic.

## Components

1.  **Frontend (Client-Side):**
    *   **Technology:** React with TypeScript, built using Vite.
    *   **Purpose:** Provides the user interface (UI) for all modules (CookBook, AgileChef, MenuBuilder, TableFarm, ChefRail). Runs in the user's web browser.
    *   **Communication:** Interacts with the backend via RESTful API calls over HTTP/S.

2.  **Backend (Server-Side):**
    *   **Technology:** Node.js with the Express framework.
    *   **Purpose:** Handles business logic, data processing, and serves as the API endpoint for the frontend. Manages interactions with the database.
    *   **API:** Exposes a RESTful API (likely using JSON for data exchange) for the frontend to consume.
    *   **Modularity:** While running as a single backend service initially, the codebase will be structured (`/src/controllers`, `/src/services`, `/src/models`, etc.) to logically separate concerns related to each KitchenSync module (CookBook, AgileChef, etc.).

3.  **Database:**
    *   **Technology:** PostgreSQL.
    *   **Purpose:** Persistently stores all application data, including recipes, ingredients, menus, orders, reservations, user information, etc.
    *   **Interaction:** The backend service interacts directly with the PostgreSQL database, likely using an ORM (Object-Relational Mapper) or a query builder library alongside the `pg` driver for Node.js.

4.  **Deployment:**
    *   **Target Platform:** Render.com (or similar Platform-as-a-Service).
    *   **Strategy:** The frontend will be built into static assets served by a web server. The backend Node.js application will run as a web service. The PostgreSQL database will be hosted as a managed service.

## Module Interaction Flow (Logical)

Based on the functional requirements, the modules interact logically as follows:

1.  **Recipe Engine (`CookBook`)** serves as the foundational data source for recipes.
2.  **Prep Flow Manager (`AgileChef`)** consumes recipe data (potentially scaled) from `CookBook` to generate prep tasks. Status updates might be internal or fed back for reporting.
3.  **Menu Designer (`MenuBuilder`)** consumes recipe data (name, description, possibly cost/pricing) from `CookBook` to allow users to construct menus.
4.  **Reservation/Order System (`TableFarm`)** consumes menu item data (defined in `MenuBuilder`) to create orders. It sends finalized order data to the `ChefRail`. It also likely receives status updates back from `ChefRail`.
5.  **Kitchen Display System (`ChefRail`)** receives order/ticket data from `TableFarm` and displays it. It sends status updates (e.g., item completed) back, likely influencing the state within `TableFarm`.

*(Diagram based on user flowchart could be added here later)* 