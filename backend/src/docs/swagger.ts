// src/docs/swagger.ts
import { version } from "../../package.json";

export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Candidate Evaluation API",
    version,
    description:
      "API used for evaluating software engineering candidates. Includes auth, users, and related resources.",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local dev",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "string", example: "ckv123..." },
          email: { type: "string", example: "user@example.com" },
          firstName: { type: "string", nullable: true, example: "Ada" },
          lastName: { type: "string", nullable: true, example: "Lovelace" },
          role: { type: "string", example: "USER" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      PaginatedUsersResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/User" },
          },
          meta: {
            type: "object",
            properties: {
              page: { type: "integer", example: 1 },
              pageSize: { type: "integer", example: 20 },
              total: { type: "integer", example: 57 },
              totalPages: { type: "integer", example: 3 },
              search: { type: "string", nullable: true, example: "ada" },
            },
          },
        },
      },
      AuthTokens: {
        type: "object",
        properties: {
          accessToken: {
            type: "string",
            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          },
        },
      },
      AuthUserWithTokensResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "object",
            properties: {
              user: { $ref: "#/components/schemas/User" },
              tokens: { $ref: "#/components/schemas/AuthTokens" },
            },
          },
        },
      },
      MeResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: { $ref: "#/components/schemas/User" },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          error: {
            type: "object",
            properties: {
              code: { type: "string", example: "VALIDATION_ERROR" },
              message: { type: "string", example: "Invalid request body" },
              details: {
                type: "object",
                nullable: true,
              },
            },
          },
        },
      },
      ProjectStatus: {
        type: "string",
        enum: ["ACTIVE", "ARCHIVED", "COMPLETED"],
        example: "ACTIVE",
      },
      ProjectRole: {
        type: "string",
        enum: ["OWNER", "ADMIN", "MEMBER", "VIEWER"],
        example: "MEMBER",
      },
      TaskStatus: {
        type: "string",
        enum: ["TODO", "IN_PROGRESS", "DONE"],
        example: "TODO",
      },
      TaskPriority: {
        type: "string",
        enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
        example: "MEDIUM",
      },
      Project: {
        type: "object",
        properties: {
          id: { type: "string", example: "clx123..." },
          name: { type: "string", example: "My Project" },
          description: { type: "string", nullable: true, example: "Project description" },
          status: { $ref: "#/components/schemas/ProjectStatus" },
          ownerId: { type: "string", example: "clx456..." },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      ProjectWithCounts: {
        type: "object",
        properties: {
          id: { type: "string", example: "clx123..." },
          name: { type: "string", example: "My Project" },
          description: { type: "string", nullable: true, example: "Project description" },
          status: { $ref: "#/components/schemas/ProjectStatus" },
          ownerId: { type: "string", example: "clx456..." },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          _count: {
            type: "object",
            properties: {
              members: { type: "integer", example: 3 },
              tasks: { type: "integer", example: 12 },
            },
          },
        },
      },
      ProjectDetail: {
        type: "object",
        properties: {
          id: { type: "string", example: "clx123..." },
          name: { type: "string", example: "My Project" },
          description: { type: "string", nullable: true, example: "Project description" },
          status: { $ref: "#/components/schemas/ProjectStatus" },
          ownerId: { type: "string", example: "clx456..." },
          owner: { $ref: "#/components/schemas/User" },
          members: {
            type: "array",
            items: { $ref: "#/components/schemas/ProjectMember" },
          },
          _count: {
            type: "object",
            properties: {
              tasks: { type: "integer", example: 12 },
            },
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      ProjectMember: {
        type: "object",
        properties: {
          id: { type: "string", example: "clx789..." },
          userId: { type: "string", example: "clx456..." },
          role: { $ref: "#/components/schemas/ProjectRole" },
          createdAt: { type: "string", format: "date-time" },
          user: {
            type: "object",
            properties: {
              id: { type: "string", example: "clx456..." },
              email: { type: "string", example: "user@example.com" },
              firstName: { type: "string", nullable: true, example: "John" },
              lastName: { type: "string", nullable: true, example: "Doe" },
            },
          },
        },
      },
      Task: {
        type: "object",
        properties: {
          id: { type: "string", example: "clx101..." },
          projectId: { type: "string", example: "clx123..." },
          title: { type: "string", example: "Task Title" },
          description: { type: "string", nullable: true, example: "Task description" },
          status: { $ref: "#/components/schemas/TaskStatus" },
          priority: { $ref: "#/components/schemas/TaskPriority" },
          assigneeId: { type: "string", nullable: true, example: "clx456..." },
          dueDate: { type: "string", format: "date-time", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          assignee: {
            type: "object",
            nullable: true,
            properties: {
              id: { type: "string", example: "clx456..." },
              email: { type: "string", example: "user@example.com" },
              firstName: { type: "string", nullable: true, example: "John" },
              lastName: { type: "string", nullable: true, example: "Doe" },
            },
          },
        },
      },
      PaginatedProjectsResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/ProjectWithCounts" },
          },
          meta: {
            type: "object",
            properties: {
              page: { type: "integer", example: 1 },
              pageSize: { type: "integer", example: 20 },
              total: { type: "integer", example: 5 },
              totalPages: { type: "integer", example: 1 },
            },
          },
        },
      },
      ProjectResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: { $ref: "#/components/schemas/Project" },
        },
      },
      ProjectDetailResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: { $ref: "#/components/schemas/ProjectDetail" },
        },
      },
      MembersListResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/ProjectMember" },
          },
        },
      },
      MemberResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: { $ref: "#/components/schemas/ProjectMember" },
        },
      },
      PaginatedTasksResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/Task" },
          },
          meta: {
            type: "object",
            properties: {
              page: { type: "integer", example: 1 },
              pageSize: { type: "integer", example: 20 },
              total: { type: "integer", example: 12 },
              totalPages: { type: "integer", example: 1 },
            },
          },
        },
      },
      TaskResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: { $ref: "#/components/schemas/Task" },
        },
      },
      DeleteResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "object",
            properties: {
              message: { type: "string", example: "Project deleted" },
            },
          },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        description:
          "Creates a new user account and returns a JWT access token along with the user.",
        security: [], // public
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "new.user@example.com",
                  },
                  password: {
                    type: "string",
                    minLength: 8,
                    example: "SuperSecret123",
                  },
                  firstName: {
                    type: "string",
                    example: "New",
                  },
                  lastName: {
                    type: "string",
                    example: "User",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "User successfully registered",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthUserWithTokensResponse",
                },
              },
            },
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          409: {
            description: "Email already in use",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login and get JWT",
        description:
          "Authenticates an existing user and returns a JWT access token along with the user.",
        security: [], // public
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "user@example.com",
                  },
                  password: {
                    type: "string",
                    example: "SuperSecret123",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthUserWithTokensResponse",
                },
              },
            },
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current user",
        description:
          "Returns the currently authenticated user's profile based on the JWT access token.",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Current user returned",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MeResponse" },
              },
            },
          },
          401: {
            description: "Missing or invalid JWT",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "User not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/users": {
      get: {
        tags: ["Users"],
        summary: "List users",
        description:
          "Returns a paginated list of users. Supports simple full-text search on email, first name, and last name.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "page",
            schema: { type: "integer", minimum: 1, default: 1 },
            description: "Page number (1-based).",
          },
          {
            in: "query",
            name: "pageSize",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
            description: "Number of items per page.",
          },
          {
            in: "query",
            name: "search",
            schema: { type: "string" },
            description:
              "Optional search term. Matches email, firstName, or lastName (case-insensitive).",
          },
        ],
        responses: {
          200: {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/PaginatedUsersResponse",
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/projects": {
      get: {
        tags: ["Projects"],
        summary: "List projects",
        description:
          "Returns a paginated list of projects where the authenticated user is a member or owner.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "page",
            schema: { type: "integer", minimum: 1, default: 1 },
            description: "Page number (1-based).",
          },
          {
            in: "query",
            name: "pageSize",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
            description: "Number of items per page.",
          },
          {
            in: "query",
            name: "status",
            schema: { $ref: "#/components/schemas/ProjectStatus" },
            description: "Filter by project status.",
          },
          {
            in: "query",
            name: "search",
            schema: { type: "string" },
            description: "Search in project name (case-insensitive).",
          },
        ],
        responses: {
          200: {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/PaginatedProjectsResponse",
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Projects"],
        summary: "Create project",
        description:
          "Creates a new project with the authenticated user as owner. Automatically adds owner as a member with OWNER role.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: {
                    type: "string",
                    minLength: 1,
                    maxLength: 100,
                    example: "My Project",
                  },
                  description: {
                    type: "string",
                    example: "Project description",
                  },
                  status: {
                    $ref: "#/components/schemas/ProjectStatus",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Project created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProjectResponse" },
              },
            },
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/projects/{id}": {
      get: {
        tags: ["Projects"],
        summary: "Get project",
        description:
          "Returns project details including owner, members, and task count. User must be a project member.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "Project ID",
          },
        ],
        responses: {
          200: {
            description: "Project details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProjectDetailResponse" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden - not a project member",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Project not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Projects"],
        summary: "Update project",
        description:
          "Updates project details. User must have OWNER or ADMIN role.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "Project ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    minLength: 1,
                    maxLength: 100,
                    example: "Updated Name",
                  },
                  description: {
                    type: "string",
                    example: "Updated description",
                  },
                  status: {
                    $ref: "#/components/schemas/ProjectStatus",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Project updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProjectResponse" },
              },
            },
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden - insufficient role",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Project not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Projects"],
        summary: "Delete project",
        description:
          "Deletes a project and all associated tasks and members. User must have OWNER role.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "Project ID",
          },
        ],
        responses: {
          200: {
            description: "Project deleted",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DeleteResponse" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden - must be OWNER",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Project not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/projects/{id}/members": {
      get: {
        tags: ["Project Members"],
        summary: "List members",
        description:
          "Returns all members of the project. User must be a project member.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "Project ID",
          },
        ],
        responses: {
          200: {
            description: "Members list",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MembersListResponse" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden - not a project member",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Project not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Project Members"],
        summary: "Add member",
        description:
          "Adds a user to the project. User must have OWNER or ADMIN role.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "Project ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["userId"],
                properties: {
                  userId: {
                    type: "string",
                    example: "clx456...",
                  },
                  role: {
                    type: "string",
                    enum: ["ADMIN", "MEMBER", "VIEWER"],
                    default: "MEMBER",
                    example: "MEMBER",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Member added",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MemberResponse" },
              },
            },
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden - insufficient role",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Project or user not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          409: {
            description: "User is already a member",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/projects/{id}/members/{userId}": {
      patch: {
        tags: ["Project Members"],
        summary: "Update member role",
        description:
          "Updates a member's role. User must have OWNER or ADMIN role. Cannot change OWNER role.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "Project ID",
          },
          {
            in: "path",
            name: "userId",
            required: true,
            schema: { type: "string" },
            description: "User ID of the member",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["role"],
                properties: {
                  role: {
                    type: "string",
                    enum: ["ADMIN", "MEMBER", "VIEWER"],
                    example: "ADMIN",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Member role updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MemberResponse" },
              },
            },
          },
          400: {
            description: "Validation error or cannot change OWNER role",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden - insufficient role",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Project or member not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Project Members"],
        summary: "Remove member",
        description:
          "Removes a member from the project. User must have OWNER or ADMIN role. Cannot remove project owner. Members can remove themselves.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "Project ID",
          },
          {
            in: "path",
            name: "userId",
            required: true,
            schema: { type: "string" },
            description: "User ID of the member",
          },
        ],
        responses: {
          200: {
            description: "Member removed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DeleteResponse" },
              },
            },
          },
          400: {
            description: "Cannot remove project owner",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden - insufficient role",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Project or member not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/projects/{id}/tasks": {
      get: {
        tags: ["Tasks"],
        summary: "List tasks",
        description:
          "Returns a paginated list of tasks in the project. User must be a project member.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "Project ID",
          },
          {
            in: "query",
            name: "page",
            schema: { type: "integer", minimum: 1, default: 1 },
            description: "Page number (1-based).",
          },
          {
            in: "query",
            name: "pageSize",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
            description: "Number of items per page.",
          },
          {
            in: "query",
            name: "status",
            schema: { $ref: "#/components/schemas/TaskStatus" },
            description: "Filter by task status.",
          },
          {
            in: "query",
            name: "priority",
            schema: { $ref: "#/components/schemas/TaskPriority" },
            description: "Filter by task priority.",
          },
          {
            in: "query",
            name: "assigneeId",
            schema: { type: "string" },
            description: "Filter by assignee user ID.",
          },
          {
            in: "query",
            name: "search",
            schema: { type: "string" },
            description: "Search in task title (case-insensitive).",
          },
        ],
        responses: {
          200: {
            description: "Tasks list",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PaginatedTasksResponse" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden - not a project member",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Project not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Tasks"],
        summary: "Create task",
        description:
          "Creates a new task in the project. User must have OWNER, ADMIN, or MEMBER role. Assignee must be a project member.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "Project ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title"],
                properties: {
                  title: {
                    type: "string",
                    minLength: 1,
                    maxLength: 200,
                    example: "Task Title",
                  },
                  description: {
                    type: "string",
                    example: "Task description",
                  },
                  status: {
                    $ref: "#/components/schemas/TaskStatus",
                  },
                  priority: {
                    $ref: "#/components/schemas/TaskPriority",
                  },
                  assigneeId: {
                    type: "string",
                    example: "clx456...",
                  },
                  dueDate: {
                    type: "string",
                    format: "date-time",
                    example: "2025-02-01T00:00:00.000Z",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Task created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TaskResponse" },
              },
            },
          },
          400: {
            description: "Validation error or invalid assignee",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden - insufficient role",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Project not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          409: {
            description: "Task with same title already exists",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/projects/{id}/tasks/{taskId}": {
      get: {
        tags: ["Tasks"],
        summary: "Get task",
        description:
          "Returns task details. User must be a project member.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "Project ID",
          },
          {
            in: "path",
            name: "taskId",
            required: true,
            schema: { type: "string" },
            description: "Task ID",
          },
        ],
        responses: {
          200: {
            description: "Task details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TaskResponse" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden - not a project member",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Project or task not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Tasks"],
        summary: "Update task",
        description:
          "Updates task details. User must have OWNER, ADMIN, or MEMBER role. Assignee must be a project member.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "Project ID",
          },
          {
            in: "path",
            name: "taskId",
            required: true,
            schema: { type: "string" },
            description: "Task ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: {
                    type: "string",
                    minLength: 1,
                    maxLength: 200,
                    example: "Updated Title",
                  },
                  description: {
                    type: "string",
                    nullable: true,
                    example: "Updated description",
                  },
                  status: {
                    $ref: "#/components/schemas/TaskStatus",
                  },
                  priority: {
                    $ref: "#/components/schemas/TaskPriority",
                  },
                  assigneeId: {
                    type: "string",
                    nullable: true,
                    example: "clx456...",
                  },
                  dueDate: {
                    type: "string",
                    format: "date-time",
                    nullable: true,
                    example: "2025-02-01T00:00:00.000Z",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Task updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TaskResponse" },
              },
            },
          },
          400: {
            description: "Validation error or invalid assignee",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden - insufficient role",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Project or task not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          409: {
            description: "Task with same title already exists",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Tasks"],
        summary: "Delete task",
        description:
          "Deletes a task. User must have OWNER or ADMIN role.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "Project ID",
          },
          {
            in: "path",
            name: "taskId",
            required: true,
            schema: { type: "string" },
            description: "Task ID",
          },
        ],
        responses: {
          200: {
            description: "Task deleted",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DeleteResponse" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden - insufficient role",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Project or task not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
  },
};
