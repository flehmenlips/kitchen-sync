# Core Requirements

## 3.1. System-Wide Requirements:

*   **SR-01:** The system shall utilize a central database (or logically connected databases) for core data like ingredients, recipes, menu items.
*   **SR-02:** Modules shall communicate via APIs (Application Programming Interfaces) to ensure loose coupling and maintainability.
*   **SR-03:** User authentication and basic authorization (initially, maybe just a single admin user).
*   **SR-04:** The system should be web-accessible.
*   **SR-05:** Consistent User Interface (UI) principles should be applied across modules where feasible.

## 3.2. Module-Specific Requirements:

### M1: Recipe Engine
*   **REQ-M1-01:** Create, Read, Update, Delete (CRUD) operations for Recipes.
*   **REQ-M1-02:** CRUD operations for Ingredients (Name, Unit of Measure, Supplier Info - future).
*   **REQ-M1-03:** Ability to define recipe ingredients with quantities and units.
*   **REQ-M1-04:** Ability to define recipe preparation steps.
*   **REQ-M1-05:** Ability to scale recipes by yield (e.g., portions) or ingredient quantity.
*   **REQ-M1-06:** Support for sub-recipes (recipes used as ingredients in other recipes).
*   **REQ-M1-07:** Search/Filter recipes (by name, tag, ingredient).
*   **REQ-M1-08:** Tagging/Categorization of recipes.
*   *(Future: Costing calculations, Nutritional info, Version history)*

### M2: Prep Flow Manager (AgileChef)
*   **REQ-M2-01:** Display prep tasks on a Kanban-style board (e.g., To Do, In Progress, Done).
*   **REQ-M2-02:** Generate prep task cards based on selected recipes and required quantities.
*   **REQ-M2-03:** Allow manual creation of prep tasks.
*   **REQ-M2-04:** Allow users to move cards between columns (update status).
*   **REQ-M2-05:** Display key recipe info (or link) on the task card.
*   *(Future: Assign tasks to users, Due dates, Priority)*

### M3: Menu Designer (Menu Builder)
*   **REQ-M3-01:** Import/select recipes from the Recipe Engine to include on a menu.
*   **REQ-M3-02:** Allow arrangement of menu items into sections (e.g., Appetizers, Mains).
*   **REQ-M3-03:** Provide basic layout/design tools (fonts, columns, borders, image upload - TBD).
*   **REQ-M3-04:** Allow saving menu layouts/templates.
*   **REQ-M3-05:** Export menus to a printable format (e.g., PDF).
*   **REQ-M3-06:** Define prices for menu items (either pulled/calculated from Recipe Engine or set manually).
*   *(Future: Multiple menu types - Lunch, Dinner, Specials; Digital menu output)*

### M4: Reservation & Order System (TableFarm)
*   **REQ-M4-01:** CRUD operations for reservations (Date, Time, Party Size, Customer Info).
*   **REQ-M4-02:** Visual representation of reservations (e.g., timeline, list).
*   **REQ-M4-03:** Ability to create a customer order.
*   **REQ-M4-04:** Add menu items (from Menu Designer output/data) to an order.
*   **REQ-M4-05:** Specify quantities and modifiers (if applicable) for order items.
*   **REQ-M4-06:** Send finalized order/ticket data to the KDS module.
*   *(Future: Table management, POS integration, Waitlist management)*

### M5: Kitchen Display System (ChefRail)
*   **REQ-M5-01:** Display incoming orders/tickets in real-time.
*   **REQ-M5-02:** Clearly show items within each order, quantities, modifiers.
*   **REQ-M5-03:** Allow kitchen staff to update the status of items/tickets (e.g., Seen, Firing, Ready, Bumped).
*   **REQ-M5-04:** Display running timers for tickets/items.
*   **REQ-M5-05:** Sort/Filter tickets (e.g., by time, by station - future).
*   *(Future: Recall bumped tickets, Station-specific views)* 