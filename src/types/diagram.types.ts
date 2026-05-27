// ─── src/types/diagram.ts ──────────────────────────────────────────────────────

export type DiagramType = "erd" | "usecase" | "activity" | "workflow" | "sequence" | "class";
export type ExportFormat = "svg" | "png" | "jpg" | "webp";

export interface DiagramTemplate {
    id: string;
    type: DiagramType;
    label: string;
    description: string;
    icon: string;
    code: string;
}

export interface DiagramRecord {
    id: string;
    title: string;
    type: DiagramType;
    code: string;
    createdAt: number;
    updatedAt: number;
}

// ─── Templates ────────────────────────────────────────────────────────────────

export const DIAGRAM_TEMPLATES: DiagramTemplate[] = [
    {
        id: "erd-ecommerce",
        type: "erd",
        label: "E-Commerce ERD",
        description: "Users, orders, products and relationships",
        icon: "database",
        code: `erDiagram
    USER {
        int id PK
        string name
        string email
        string phone
        datetime created_at
    }
    ADDRESS {
        int id PK
        int user_id FK
        string street
        string city
        string country
        string zip
    }
    PRODUCT {
        int id PK
        string name
        text description
        decimal price
        int stock
        int category_id FK
    }
    CATEGORY {
        int id PK
        string name
        string slug
    }
    ORDER {
        int id PK
        int user_id FK
        int address_id FK
        string status
        decimal total
        datetime placed_at
    }
    ORDER_ITEM {
        int id PK
        int order_id FK
        int product_id FK
        int quantity
        decimal unit_price
    }
    PAYMENT {
        int id PK
        int order_id FK
        string method
        string status
        decimal amount
        datetime paid_at
    }

    USER ||--o{ ADDRESS : "has"
    USER ||--o{ ORDER : "places"
    ORDER ||--|{ ORDER_ITEM : "contains"
    ORDER ||--o{ PAYMENT : "paid via"
    ORDER }o--|| ADDRESS : "ships to"
    PRODUCT }|--|| CATEGORY : "belongs to"
    ORDER_ITEM }o--|| PRODUCT : "references"`,
    },
    {
        id: "usecase-auth",
        type: "usecase",
        label: "Auth System Use Case",
        description: "Login, registration & access control",
        icon: "users",
        code: `@startuml
!theme plain
skinparam backgroundColor transparent
skinparam actorStyle awesome
skinparam usecaseBorderColor #1856FF
skinparam usecaseBackgroundColor #EEF2F6
skinparam usecaseFontSize 13
skinparam arrowColor #475569
skinparam actorBorderColor #1856FF
skinparam actorFontSize 13

left to right direction

actor "Guest" as guest
actor "Registered User" as user
actor "Admin" as admin
actor "OAuth Provider" as oauth #technology

rectangle "Authentication System" {
  usecase "Register Account" as UC1
  usecase "Login with Email" as UC2
  usecase "Login with OAuth" as UC3
  usecase "Reset Password" as UC4
  usecase "Verify Email" as UC5
  usecase "Manage Profile" as UC6
  usecase "Two-Factor Auth" as UC7
  usecase "View Dashboard" as UC8
  usecase "Manage Users" as UC9
  usecase "Audit Logs" as UC10
}

guest --> UC1
guest --> UC2
guest --> UC3

UC3 ..> oauth : <<extends>>
UC1 ..> UC5 : <<include>>
UC2 ..> UC7 : <<extends>>

user --> UC4
user --> UC6
user --> UC8

admin --> UC9
admin --> UC10
admin --|> user
@enduml`,
    },
    {
        id: "activity-checkout",
        type: "activity",
        label: "Checkout Activity",
        description: "E-commerce checkout flow",
        icon: "activity",
        code: `@startuml
!theme plain
skinparam backgroundColor transparent
skinparam activityBorderColor #1856FF
skinparam activityBackgroundColor #EEF2F6
skinparam activityFontSize 13
skinparam arrowColor #475569
skinparam startColor #1856FF
skinparam endColor #1856FF

start

:View Cart;

if (Cart empty?) then (yes)
  :Show empty cart message;
  stop
else (no)
  :Proceed to Checkout;
endif

:Enter Shipping Address;

if (Address valid?) then (no)
  :Show validation error;
  :Re-enter Address;
  -> :Enter Shipping Address;
else (yes)
  :Select Payment Method;
endif

if (Payment Method == Credit Card) then (yes)
  :Enter Card Details;
  :3D Secure Check;
elseif (Payment Method == PayPal) then (yes)
  :Redirect to PayPal;
else
  :Show Wallet Address;
endif

:Review Order Summary;

if (Confirm Order?) then (yes)
  :Process Payment;
  if (Payment success?) then (yes)
    :Create Order;
    :Send Confirmation Email;
    :Update Inventory;
    :Show Success Page;
  else
    :Show Payment Error;
    :Retry or Change Method;
    -> :Select Payment Method;
  endif
else (cancel)
  :Return to Cart;
  stop
endif

stop
@enduml`,
    },
    {
        id: "workflow-cicd",
        type: "workflow",
        label: "CI/CD Pipeline",
        description: "Build, test and deploy workflow",
        icon: "git-branch",
        code: `flowchart TD
    A([🚀 Developer Push]) --> B[Trigger CI Pipeline]
    B --> C{Branch Type?}

    C -->|feature/*| D[Run Linter]
    C -->|main| E[Full Pipeline]
    C -->|release/*| F[Release Pipeline]

    D --> D1[Run Unit Tests]
    D1 --> D2{Tests Pass?}
    D2 -->|No| D3[❌ Notify Developer]
    D2 -->|Yes| D4[✅ PR Ready for Review]

    E --> E1[Install Dependencies]
    E1 --> E2[Build Application]
    E2 --> E3[Unit Tests]
    E3 --> E4[Integration Tests]
    E4 --> E5[Security Scan]
    E5 --> E6{All Checks Pass?}
    E6 -->|No| E7[❌ Block Merge]
    E6 -->|Yes| E8[Build Docker Image]
    E8 --> E9[Push to Registry]
    E9 --> E10[Deploy to Staging]
    E10 --> E11[Smoke Tests]
    E11 --> E12{Staging OK?}
    E12 -->|No| E13[🔄 Rollback Staging]
    E12 -->|Yes| E14[Deploy to Production]
    E14 --> E15[Health Check]
    E15 --> E16{Healthy?}
    E16 -->|No| E17[🔄 Auto Rollback]
    E16 -->|Yes| E18[✅ Deployment Success]

    F --> F1[Version Bump]
    F1 --> F2[Generate Changelog]
    F2 --> F3[Create GitHub Release]
    F3 --> E

    style A fill:#1856FF,color:#fff,stroke:none
    style E18 fill:#07CA6B,color:#fff,stroke:none
    style D3 fill:#EA2143,color:#fff,stroke:none
    style E7 fill:#EA2143,color:#fff,stroke:none
    style E17 fill:#E89558,color:#fff,stroke:none
    style D4 fill:#07CA6B,color:#fff,stroke:none`,
    },
    {
        id: "sequence-api",
        type: "sequence",
        label: "REST API Sequence",
        description: "Client-server API communication",
        icon: "arrow-right-left",
        code: `sequenceDiagram
    autonumber
    actor Client as 📱 Client
    participant Gateway as API Gateway
    participant Auth as Auth Service
    participant API as Product Service
    participant Cache as Redis Cache
    participant DB as PostgreSQL

    Client->>+Gateway: GET /api/products?page=1
    Gateway->>+Auth: Validate Bearer Token
    Auth-->>-Gateway: ✅ Token Valid (userId: 42)
    
    Gateway->>+API: Forward Request + userId
    API->>+Cache: GET products:page:1
    
    alt Cache Hit
        Cache-->>API: Return cached data
        API-->>Gateway: 200 OK (from cache)
    else Cache Miss
        Cache-->>-API: null
        API->>+DB: SELECT * FROM products LIMIT 20
        DB-->>-API: Product rows
        API->>Cache: SET products:page:1 (TTL: 300s)
        API-->>-Gateway: 200 OK (from DB)
    end

    Gateway-->>-Client: 200 JSON Response

    Note over Client,DB: Cache-aside pattern for performance

    Client->>+Gateway: POST /api/products
    Gateway->>Auth: Validate + Check ADMIN role
    Auth-->>Gateway: ✅ Admin confirmed
    Gateway->>+API: Create product
    API->>+DB: INSERT INTO products
    DB-->>-API: New product row
    API->>Cache: INVALIDATE products:*
    API-->>-Gateway: 201 Created
    Gateway-->>-Client: 201 JSON Response`,
    },
    {
        id: "class-solid",
        type: "class",
        label: "SOLID Class Design",
        description: "Clean architecture with SOLID principles",
        icon: "layers",
        code: `classDiagram
    direction TB

    class UserRepository {
        <<interface>>
        +findById(id: string) User
        +findByEmail(email: string) User
        +save(user: User) User
        +delete(id: string) void
    }

    class PostgresUserRepository {
        -db: Database
        +findById(id: string) User
        +findByEmail(email: string) User
        +save(user: User) User
        +delete(id: string) void
        -mapRowToUser(row: Row) User
    }

    class CachedUserRepository {
        -cache: CacheService
        -inner: UserRepository
        +findById(id: string) User
        +findByEmail(email: string) User
        +save(user: User) User
        +delete(id: string) void
    }

    class UserService {
        -repo: UserRepository
        -events: EventBus
        -hasher: PasswordHasher
        +register(dto: RegisterDTO) User
        +login(dto: LoginDTO) AuthToken
        +updateProfile(id: string, dto: UpdateDTO) User
        +deactivate(id: string) void
    }

    class User {
        +id: string
        +email: string
        -passwordHash: string
        +name: string
        +role: UserRole
        +createdAt: Date
        +isActive: boolean
        +validatePassword(plain: string) bool
        +toDTO() UserDTO
    }

    class UserRole {
        <<enumeration>>
        ADMIN
        USER
        MODERATOR
    }

    class PasswordHasher {
        <<interface>>
        +hash(plain: string) string
        +verify(plain: string, hash: string) bool
    }

    class BcryptHasher {
        -rounds: number
        +hash(plain: string) string
        +verify(plain: string, hash: string) bool
    }

    UserRepository <|.. PostgresUserRepository : implements
    UserRepository <|.. CachedUserRepository : implements
    CachedUserRepository --> UserRepository : decorates
    UserService --> UserRepository : depends on
    UserService --> PasswordHasher : depends on
    User --> UserRole : has
    PasswordHasher <|.. BcryptHasher : implements
    UserService ..> User : creates`,
    },
];

export const DIAGRAM_TYPE_META: Record<
    DiagramType,
    { label: string; color: string; engine: "mermaid" | "plantuml" }
> = {
    erd: { label: "ERD", color: "#07CA6B", engine: "mermaid" },
    usecase: { label: "Use Case", color: "#1856FF", engine: "plantuml" },
    activity: { label: "Activity", color: "#E89558", engine: "plantuml" },
    workflow: { label: "Workflow", color: "#7C3AED", engine: "mermaid" },
    sequence: { label: "Sequence", color: "#2D9CDB", engine: "mermaid" },
    class: { label: "Class", color: "#EA2143", engine: "mermaid" },
};