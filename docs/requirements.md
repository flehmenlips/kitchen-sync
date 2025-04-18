# Core Requirements (Initial Draft - High Level)

This document outlines the core functional requirements for the KitchenSync system.

## 1. Recipe Engine (CookBook)

*   **CR1.1:** Ability to create, edit, delete, and view recipes.
*   **CR1.2:** Recipes should include ingredients, quantities, units, instructions, yield, and potentially cost information.
*   **CR1.3:** Ability to scale recipes based on desired yield.
*   **CR1.4:** Ability to categorize or tag recipes (e.g., by course, cuisine).
*   **CR1.5:** Store recipe data persistently (in PostgreSQL database).

## 2. Prep Flow Manager (AgileChef)

*   **CR2.1:** Generate prep lists/tasks based on selected recipes and required quantities (likely derived from orders or menu forecasts).
*   **CR2.2:** Display prep tasks clearly, potentially organized by station or urgency.
*   **CR2.3:** Allow kitchen staff to mark tasks as started or completed.
*   **CR2.4:** Utilize scaled ingredient lists from the Recipe Engine.

## 3. Menu Designer (MenuBuilder)

*   **CR3.1:** Ability to create, edit, and manage multiple menus (e.g., Dinner, Lunch, Specials).
*   **CR3.2:** Add items to menus, pulling recipe data (name, description, potentially price) from the Recipe Engine.
*   **CR3.3:** Define menu item pricing.
*   **CR3.4:** Organize menu layout (sections, order of items).
*   **CR3.5:** Generate printable or viewable menu formats.

## 4. Reservation/Order System (TableFarm)

*   **CR4.1:** (**Future Scope / TBD**) Manage table reservations (create, view, update status).
*   **CR4.2:** Allow staff to create customer orders (select menu items, quantities).
*   **CR4.3:** Calculate order totals based on menu item prices.
*   **CR4.4:** Send finalized orders/tickets to the Kitchen Display System.
*   **CR4.5:** Track order status (e.g., received, preparing, ready, served).
*   **CR4.6:** Persist order and reservation data (in PostgreSQL database).

## 5. Kitchen Display System (ChefRail)

*   **CR5.1:** Display incoming orders/tickets from the Order System in real-time.
*   **CR5.2:** Organize tickets logically (e.g., by time, table, course).
*   **CR5.3:** Allow kitchen staff to mark orders/items as started, ready, or completed.
*   **CR5.4:** Potentially provide summaries or timers for orders.
*   **CR5.5:** Reflect order status updates back to the Order System (or relevant interface).

## Cross-Cutting Requirements

*   **CCR1:** User authentication and authorization (role-based access for different staff).
*   **CCR2:** System should be accessible via a web browser.
*   **CCR3:** Intuitive and responsive user interfaces for both front-of-house and back-of-house staff. 