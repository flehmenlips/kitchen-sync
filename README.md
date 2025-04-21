# KitchenSync

## 1. Project Description

### 1.1. Vision
To create a centralized, dynamic, customizable, and comprehensive software suite that seamlessly integrates all core aspects of kitchen and restaurant management, from initial recipe conception to final order delivery on the line.

### 1.2. Goal
To streamline restaurant operations by unifying recipe development, kitchen prep workflows, menu creation, reservations, and order management into a single, interconnected system. This system aims to reduce redundancy, improve efficiency, enhance consistency, and provide valuable data insights for a modern kitchen.

### 1.3. Core Modules:

*   **Recipe Engine (CookBook):** A robust database and interface for creating, storing, searching, scaling, costing (future goal), and managing recipes and sub-recipes.
*   **Prep Flow Manager (AgileChef Integration):** A Kanban-style workflow tool visualizing and managing kitchen prep tasks derived from recipes and production needs.
*   **Menu Designer (MenuBuilder Integration):** A tool for designing, laying out, and printing/exporting menus, pulling data directly from the Recipe Engine.
*   **Reservation & Order System (TableFarm Integration):** Manages customer reservations, potentially table management, and captures customer orders, linking them to menu items.
*   **Kitchen Display System (ChefRail):** Displays active orders/tickets from the Reservation & Order System in real-time for the cooking line, allowing for status updates.

### 1.4. Key Principles:

*   **Data Flow:** Information should flow logically between modules (e.g., a recipe created in the Recipe Engine can be used to generate prep tasks in AgileChef and appear as an item in MenuBuilder).
*   **Modularity:** Design components to be relatively independent but communicate via well-defined APIs, allowing for easier development, maintenance, and potential future swapping of components.
*   **Customizability:** Allow users (initially me) to tailor aspects of the system to specific workflows or restaurant needs.
*   **Centralization:** A core database or set of interconnected databases should serve as the single source of truth for recipes, menu items, ingredients, etc.

## 2. High-Level Flow Chart (Conceptual Data Flow)

```
+---------------------+      +-----------------------+      +---------------------+ 
| 1. Recipe Engine    |----->| 2. Prep Flow Manager  |----->| (Feedback/Status?)  |
| (Create, Scale,     |  (Recipe Data, Scaled  |      | (Prep Task Status)  |
|  Manage Recipes)    |   Ingredients, Tasks)  |      +---------------------+
+--------^------------+      +----------^------------+
         |                       | (Production Needs?) 
(Recipe Data, Pricing?)        |
         |                       |
         v                       |
+--------+------------+      +-----------------------+      +-----------------------+
| 3. Menu Designer    |----->| 4. Reservation/Order  |----->| 5. Kitchen Display    |
| (Layout, Print Menus)|  (Menu Item Data)     |    System (Rez_Coq?)   |      |   System (KDS)        |
| (Using Recipe Data) |      +-----------------------+      |  (Order/Ticket Data)  |
+---------------------+                                     +----------+------------+
                                                                       |
                                                                       | (Order Status Updates)
                                                                       v
                                                                 (Back to Order Sys?)
```

**Explanation:**

*   **Recipe Engine (CookBook):** The foundation. Creates and manages all recipe data.
*   **Prep Flow Manager (AgileChef):** Pulls specific recipes and scaling information from the Recipe Engine to generate prep task cards. May receive input on daily production needs. Status updates on tasks might feed back somewhere (TBD).
*   **Menu Designer (MenuBuilder):** Pulls finalized recipe details (name, description, possibly price calculated from Recipe Engine) to design menus.
*   **Reservation/Order System (TableFarm):** Uses the menu item data defined via the Menu Designer. Takes reservations and customer orders.
*   **Kitchen Display System (KDS):** Receives confirmed orders/tickets from the Order System for display on the kitchen line. Status updates (e.g., "Firing," "Ready") might feed back to the Order System or POS.

## Tech Stack

*   **Frontend:** React, Vite, TypeScript
*   **Backend:** Node.js, Express
*   **Database:** PostgreSQL
*   **Deployment:** Render.com

## 4. High-Level Project Strategy & Next Steps

### 4.1. Strategy Outline:

#### Immediate Priority Features:
1. **System Administration & Security**
   - Implementation of SuperAdmin role (george@seabreeze.farm)
   - Enhanced user role management system
   - Audit logging for critical operations

2. **Feature & Bug Tracking System**
   - Internal admin interface for tracking and managing issues
   - Customer-facing feedback/issue reporting interface
   - Issue prioritization and status tracking
   - Integration with development workflow

3. **Backup & Data Security**
   - Automated database backup system
   - Backup verification and integrity checks
   - Backup restoration testing procedures
   - Data export capabilities for users

#### Module Development Status:

1. **CookBook (Recipe Engine)**
   - Status: Active Development / Testing
   - Current Focus: Real-world recipe input and testing
   - Next Steps: Bug fixes and feature enhancements based on actual usage

2. **AgileChef (Prep Flow)**
   - Status: Planning
   - Dependencies: Stable CookBook module

3. **MenuBuilder**
   - Status: Planning
   - Dependencies: Stable CookBook module

4. **TableFarm**
   - Status: Planning
   - Dependencies: Stable MenuBuilder module

5. **ChefRail**
   - Status: Planning
   - Dependencies: Stable TableFarm module

### 4.2. Development Principles:
- Test-driven development for new features
- Regular backup testing and verification
- Security-first approach to user management
- User feedback integration into development cycle

## Setup

*   (Instructions TBD) 