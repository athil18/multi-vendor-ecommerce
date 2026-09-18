import { withErrorHandler } from '@/lib/api-handler';
import { NextResponse } from 'next/server';
import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@/lib/schemas/auth';
import {
  createProductSchema,
  updateProductSchema,
  createOrderSchema,
  createStoreSchema,
  productStatusUpdateSchema,
  orderItemStatusUpdateSchema,
  createCategorySchema,
  createAddressSchema,
} from '@/lib/schemas/commerce';

const registry = new OpenAPIRegistry();

// Register Security Scheme for JWT
registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
  description: 'Enter your JWT access token.',
});

// Register Core Zod Schemas
registry.register('RegisterRequest', registerSchema);
registry.register('LoginRequest', loginSchema);
registry.register('ForgotPasswordRequest', forgotPasswordSchema);
registry.register('ResetPasswordRequest', resetPasswordSchema);
registry.register('CreateProductRequest', createProductSchema);
registry.register('UpdateProductRequest', updateProductSchema);
registry.register('ProductStatusUpdateRequest', productStatusUpdateSchema);
registry.register('CreateOrderRequest', createOrderSchema);
registry.register('OrderItemStatusUpdateRequest', orderItemStatusUpdateSchema);
registry.register('CreateStoreRequest', createStoreSchema);
registry.register('CreateCategoryRequest', createCategorySchema);
registry.register('CreateAddressRequest', createAddressSchema);
registry.register('UpdateAddressRequest', createAddressSchema.partial());

// Define Common Error Responses
const errorResponse = (description: string, code?: string) => ({
  description,
  content: {
    'application/json': {
      schema: z.object({
        message: z.string().openapi({ example: description }),
        code: z.string().optional().openapi({ example: code || 'ERROR_CODE' }),
      }),
    },
  },
});

// ---------------------------------------------------------
// Standardized Error Response Definitions
// ---------------------------------------------------------
const validationErrorResponse = {
  description: 'Validation failed (e.g. invalid fields, email format)',
  content: {
    'application/json': {
      schema: z.object({
        message: z.string().openapi({ example: 'Validation failed' }),
        code: z.string().openapi({ example: 'VALIDATION_ERROR' }),
        errors: z.record(z.string(), z.array(z.string())).openapi({
          example: {
            email: ['Invalid email address'],
            password: ['Password must be at least 8 characters'],
          },
        }),
      }),
    },
  },
};

const authErrorResponse = {
  description: 'Not authenticated (missing or invalid JWT token)',
  content: {
    'application/json': {
      schema: z.object({
        message: z.string().openapi({ example: 'Not authorized' }),
        code: z.string().openapi({ example: 'AUTHENTICATION_ERROR' }),
      }),
    },
  },
};

const forbiddenErrorResponse = {
  description: 'Forbidden (authenticated but lacks required role or ownership permissions)',
  content: {
    'application/json': {
      schema: z.object({
        message: z.string().openapi({ example: 'Forbidden' }),
        code: z.string().openapi({ example: 'AUTHORIZATION_ERROR' }),
      }),
    },
  },
};

const notFoundErrorResponse = {
  description: 'Resource not found',
  content: {
    'application/json': {
      schema: z.object({
        message: z.string().openapi({ example: 'Resource not found' }),
        code: z.string().openapi({ example: 'NOT_FOUND_ERROR' }),
      }),
    },
  },
};

const conflictErrorResponse = {
  description: 'Resource conflict (e.g. email or store name already taken)',
  content: {
    'application/json': {
      schema: z.object({
        message: z.string().openapi({ example: 'Resource already exists' }),
        code: z.string().openapi({ example: 'CONFLICT_ERROR' }),
      }),
    },
  },
};

const rateLimitErrorResponse = {
  description: 'Rate limit exceeded',
  content: {
    'application/json': {
      schema: z.object({
        message: z.string().openapi({ example: 'Too many requests' }),
        code: z.string().openapi({ example: 'RATE_LIMIT_ERROR' }),
      }),
    },
  },
};

const internalErrorResponse = {
  description: 'Internal Server Error',
  content: {
    'application/json': {
      schema: z.object({
        message: z.string().openapi({ example: 'Internal server error' }),
        code: z.string().openapi({ example: 'INTERNAL_ERROR' }),
      }),
    },
  },
};

// ---------------------------------------------------------
// 1. Authentication Endpoints
// ---------------------------------------------------------

registry.registerPath({
  method: 'post',
  path: '/api/auth/register',
  tags: ['Authentication'],
  summary: 'Register User',
  description: 'Creates a new user account with default customer role.',
  request: {
    body: {
      content: {
        'application/json': {
          schema: registerSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Registration successful',
      content: {
        'application/json': {
          schema: z.object({
            accessToken: z.string().openapi({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwN2YxZj...[access_token]' }),
            user: z.object({
              id: z.string().openapi({ example: '607f1f77bcf86cd799439011' }),
              name: z.string().openapi({ example: 'John Doe' }),
              email: z.string().openapi({ example: 'john.doe@example.com' }),
              role: z.string().openapi({ example: 'customer' }),
            }),
          }),
        },
      },
    },
    400: validationErrorResponse,
    409: conflictErrorResponse,
    500: internalErrorResponse,
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/auth/login',
  tags: ['Authentication'],
  summary: 'User Login',
  description: 'Authenticates a user and sets secure HttpOnly cookie with refresh token.',
  request: {
    body: {
      content: {
        'application/json': {
          schema: loginSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Login successful. Sets HttpOnly refreshToken cookie.',
      content: {
        'application/json': {
          schema: z.object({
            accessToken: z.string().openapi({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwN2YxZj...[access_token]' }),
            user: z.object({
              id: z.string().openapi({ example: '607f1f77bcf86cd799439011' }),
              name: z.string().openapi({ example: 'John Doe' }),
              email: z.string().openapi({ example: 'john.doe@example.com' }),
              role: z.string().openapi({ example: 'customer' }),
            }),
          }),
        },
      },
    },
    400: validationErrorResponse,
    401: authErrorResponse,
    500: internalErrorResponse,
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/auth/refresh',
  tags: ['Authentication'],
  summary: 'Refresh Access Token',
  description: 'Uses the secure httpOnly refresh token cookie to issue a new access token and rotate the refresh token.',
  responses: {
    200: {
      description: 'Refresh successful. Rotates cookies.',
      content: {
        'application/json': {
          schema: z.object({
            accessToken: z.string().openapi({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwN2YxZj...[new_access_token]' }),
          }),
        },
      },
    },
    401: authErrorResponse,
    500: internalErrorResponse,
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/auth/logout',
  tags: ['Authentication'],
  summary: 'User Logout',
  description: 'Clears the secure refresh token cookie and revokes the active token session.',
  responses: {
    200: {
      description: 'Logout successful',
      content: {
        'application/json': {
          schema: z.object({
            message: z.string().openapi({ example: 'Logged out successfully' }),
          }),
        },
      },
    },
    500: internalErrorResponse,
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/auth/me',
  tags: ['Authentication'],
  summary: 'Current User Profile',
  description: 'Returns the profile details of the currently authenticated user.',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'Profile retrieved successfully',
      content: {
        'application/json': {
          schema: z.object({
            id: z.string().openapi({ example: '607f1f77bcf86cd799439011' }),
            name: z.string().openapi({ example: 'John Doe' }),
            email: z.string().openapi({ example: 'john.doe@example.com' }),
            role: z.string().openapi({ example: 'customer' }),
            status: z.string().openapi({ example: 'active' }),
          }),
        },
      },
    },
    401: authErrorResponse,
    500: internalErrorResponse,
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/auth/forgot-password',
  tags: ['Authentication'],
  summary: 'Forgot Password Request',
  description: 'Generates a temporary reset password token and returns it (development only).',
  request: {
    body: {
      content: {
        'application/json': {
          schema: forgotPasswordSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Reset request received successfully',
      content: {
        'application/json': {
          schema: z.object({
            message: z.string().openapi({ example: 'If a user with that email exists, a reset link has been sent.' }),
            resetToken: z.string().optional().openapi({ example: 'reset-token-xyz-123' }),
          }),
        },
      },
    },
    400: validationErrorResponse,
    500: internalErrorResponse,
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/auth/reset-password',
  tags: ['Authentication'],
  summary: 'Reset Password',
  description: 'Resets the password of the user using a valid reset token.',
  request: {
    body: {
      content: {
        'application/json': {
          schema: resetPasswordSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Password reset successful',
      content: {
        'application/json': {
          schema: z.object({
            message: z.string().openapi({ example: 'Password reset successful' }),
          }),
        },
      },
    },
    400: validationErrorResponse,
    500: internalErrorResponse,
  },
});

// ---------------------------------------------------------
// 2. Products Endpoints
// ---------------------------------------------------------

registry.registerPath({
  method: 'get',
  path: '/api/products',
  tags: ['Products'],
  summary: 'List / Search Products',
  description: 'Retrieves a paginated list of published products with search filters.',
  request: {
    query: z.object({
      keyword: z.string().optional().openapi({ description: 'Full-text search keyword', example: 'laptop' }),
      category: z.string().optional().openapi({ description: 'Category ID filter', example: '607f1f77bcf86cd799439014' }),
      brand: z.string().optional().openapi({ description: 'Brand ID filter', example: '607f1f77bcf86cd799439015' }),
      minPrice: z.coerce.number().optional().openapi({ description: 'Minimum price filter', example: 10 }),
      maxPrice: z.coerce.number().optional().openapi({ description: 'Maximum price filter', example: 1000 }),
      inStock: z.string().optional().openapi({ description: 'Filter by in-stock status ("true"/"false")', example: 'true' }),
      sort: z.enum(['newest', 'price_asc', 'price_desc', 'popular', 'top_rated']).optional().openapi({ description: 'Sorting strategy', example: 'newest' }),
      page: z.coerce.number().optional().openapi({ description: 'Page number', example: 1 }),
      limit: z.coerce.number().optional().openapi({ description: 'Items per page', example: 20 }),
    }),
  },
  responses: {
    200: {
      description: 'List retrieved successfully',
      content: {
        'application/json': {
          schema: z.object({
            data: z.array(z.object({
              _id: z.string().openapi({ example: '607f1f77bcf86cd799439020' }),
              name: z.string().openapi({ example: 'Wireless Mouse' }),
              description: z.string().openapi({ example: 'Ergonomic optical wireless mouse' }),
              slug: z.string().openapi({ example: 'wireless-mouse-1623849103' }),
              basePrice: z.number().openapi({ example: 29.99 }),
              categoryId: z.object({
                _id: z.string().openapi({ example: '607f1f77bcf86cd799439014' }),
                name: z.string().openapi({ example: 'Electronics' }),
                slug: z.string().openapi({ example: 'electronics' }),
              }),
              images: z.array(z.string()).openapi({ example: ['https://example.com/mouse.jpg'] }),
              tags: z.array(z.string()).openapi({ example: ['accessory', 'wireless'] }),
              status: z.string().openapi({ example: 'published' }),
              sellerId: z.string().openapi({ example: '607f1f77bcf86cd799439013' }),
              createdAt: z.string().openapi({ example: '2026-06-15T10:00:00.000Z' }),
              updatedAt: z.string().openapi({ example: '2026-06-15T10:00:00.000Z' }),
            })),
            meta: z.object({
              page: z.number().openapi({ example: 1 }),
              limit: z.number().openapi({ example: 20 }),
              total: z.number().openapi({ example: 1 }),
              totalPages: z.number().openapi({ example: 1 }),
            }),
          }),
        },
      },
    },
    500: internalErrorResponse,
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/products',
  tags: ['Products'],
  summary: 'Create Product',
  description: 'Creates a new product in draft mode. Access restricted to sellers and admins.',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: createProductSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Product created successfully',
      content: {
        'application/json': {
          schema: z.object({
            _id: z.string().openapi({ example: '607f1f77bcf86cd799439020' }),
            name: z.string().openapi({ example: 'Wireless Mouse' }),
            description: z.string().optional().openapi({ example: 'Ergonomic optical wireless mouse' }),
            slug: z.string().openapi({ example: 'wireless-mouse-1623849103' }),
            basePrice: z.number().openapi({ example: 29.99 }),
            categoryId: z.string().openapi({ example: '607f1f77bcf86cd799439014' }),
            brandId: z.string().optional().openapi({ example: '607f1f77bcf86cd799439015' }),
            images: z.array(z.string()).optional().openapi({ example: ['https://example.com/mouse.jpg'] }),
            tags: z.array(z.string()).optional().openapi({ example: ['accessory', 'wireless'] }),
            status: z.string().openapi({ example: 'draft' }),
            sellerId: z.string().openapi({ example: '607f1f77bcf86cd799439013' }),
            createdAt: z.string().openapi({ example: '2026-06-16T12:00:00.000Z' }),
            updatedAt: z.string().openapi({ example: '2026-06-16T12:00:00.000Z' }),
          }),
        },
      },
    },
    400: validationErrorResponse,
    401: authErrorResponse,
    403: forbiddenErrorResponse,
    500: internalErrorResponse,
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/products/{id}',
  tags: ['Products'],
  summary: 'Product Details',
  description: 'Returns detailed information about a product. Non-published products require seller owner or admin access.',
  request: {
    params: z.object({
      id: z.string().openapi({ description: 'Product ID', example: '607f1f77bcf86cd799439020' }),
    }),
  },
  responses: {
    200: {
      description: 'Product details retrieved successfully',
      content: {
        'application/json': {
          schema: z.object({
            _id: z.string().openapi({ example: '607f1f77bcf86cd799439020' }),
            name: z.string().openapi({ example: 'Wireless Mouse' }),
            description: z.string().openapi({ example: 'Ergonomic optical wireless mouse' }),
            slug: z.string().openapi({ example: 'wireless-mouse-1623849103' }),
            basePrice: z.number().openapi({ example: 29.99 }),
            categoryId: z.object({
              _id: z.string().openapi({ example: '607f1f77bcf86cd799439014' }),
              name: z.string().openapi({ example: 'Electronics' }),
              slug: z.string().openapi({ example: 'electronics' }),
            }),
            sellerId: z.object({
              _id: z.string().openapi({ example: '607f1f77bcf86cd799439013' }),
              name: z.string().openapi({ example: 'Tech Store' }),
              email: z.string().openapi({ example: 'seller@example.com' }),
            }),
            images: z.array(z.string()).openapi({ example: ['https://example.com/mouse.jpg'] }),
            tags: z.array(z.string()).openapi({ example: ['accessory', 'wireless'] }),
            status: z.string().openapi({ example: 'published' }),
            createdAt: z.string().openapi({ example: '2026-06-15T10:00:00.000Z' }),
            updatedAt: z.string().openapi({ example: '2026-06-15T10:00:00.000Z' }),
          }),
        },
      },
    },
    400: errorResponse('Invalid product ID format', 'VALIDATION_ERROR'),
    404: notFoundErrorResponse,
    500: internalErrorResponse,
  },
});

registry.registerPath({
  method: 'put',
  path: '/api/products/{id}',
  tags: ['Products'],
  summary: 'Update Product',
  description: 'Updates product details. Restricted to the seller owner or admin. Rejected products cannot be modified.',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ description: 'Product ID', example: '607f1f77bcf86cd799439020' }),
    }),
    body: {
      content: {
        'application/json': {
          schema: updateProductSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Product updated successfully',
      content: {
        'application/json': {
          schema: z.object({
            _id: z.string().openapi({ example: '607f1f77bcf86cd799439020' }),
            name: z.string().openapi({ example: 'Wireless Mouse V2' }),
            description: z.string().openapi({ example: 'Updated description' }),
            slug: z.string().openapi({ example: 'wireless-mouse-v2-1623849103' }),
            basePrice: z.number().openapi({ example: 34.99 }),
            categoryId: z.any().openapi({ example: '607f1f77bcf86cd799439014' }),
            brandId: z.any().openapi({ example: '607f1f77bcf86cd799439015' }),
            images: z.array(z.string()).openapi({ example: ['https://example.com/mousev2.jpg'] }),
            tags: z.array(z.string()).openapi({ example: ['accessory', 'wireless', 'v2'] }),
            status: z.string().openapi({ example: 'draft' }),
            sellerId: z.string().openapi({ example: '607f1f77bcf86cd799439013' }),
            createdAt: z.string().openapi({ example: '2026-06-15T10:00:00.000Z' }),
            updatedAt: z.string().openapi({ example: '2026-06-16T12:30:00.000Z' }),
          }),
        },
      },
    },
    400: errorResponse('Cannot edit a rejected product. Revert it to draft first.', 'VALIDATION_ERROR'),
    401: authErrorResponse,
    403: forbiddenErrorResponse,
    404: notFoundErrorResponse,
    500: internalErrorResponse,
  },
});

registry.registerPath({
  method: 'delete',
  path: '/api/products/{id}',
  tags: ['Products'],
  summary: 'Delete Product',
  description: 'Deletes a product and cascades deletion to all its variants. A published product cannot be deleted.',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ description: 'Product ID', example: '607f1f77bcf86cd799439020' }),
    }),
  },
  responses: {
    200: {
      description: 'Product deleted successfully',
      content: {
        'application/json': {
          schema: z.object({
            message: z.string().openapi({ example: 'Product and its variants deleted successfully' }),
          }),
        },
      },
    },
    400: errorResponse('Cannot delete a published product. Archive it first.', 'VALIDATION_ERROR'),
    401: authErrorResponse,
    403: forbiddenErrorResponse,
    404: notFoundErrorResponse,
    500: internalErrorResponse,
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/products/slug/{slug}',
  tags: ['Products'],
  summary: 'Product Details by Slug',
  description: 'Returns product details using its unique URL-friendly slug.',
  request: {
    params: z.object({
      slug: z.string().openapi({ description: 'Product Slug', example: 'wireless-mouse-1623849103' }),
    }),
  },
  responses: {
    200: {
      description: 'Product retrieved successfully',
      content: {
        'application/json': {
          schema: z.object({
            _id: z.string().openapi({ example: '607f1f77bcf86cd799439020' }),
            name: z.string().openapi({ example: 'Wireless Mouse' }),
            description: z.string().openapi({ example: 'Ergonomic optical wireless mouse' }),
            slug: z.string().openapi({ example: 'wireless-mouse-1623849103' }),
            basePrice: z.number().openapi({ example: 29.99 }),
            status: z.string().openapi({ example: 'published' }),
            sellerId: z.string().openapi({ example: '607f1f77bcf86cd799439013' }),
            createdAt: z.string().openapi({ example: '2026-06-15T10:00:00.000Z' }),
            updatedAt: z.string().openapi({ example: '2026-06-15T10:00:00.000Z' }),
          }),
        },
      },
    },
    404: notFoundErrorResponse,
    500: internalErrorResponse,
  },
});

// ---------------------------------------------------------
// 3. Orders Endpoints
// ---------------------------------------------------------

registry.registerPath({
  method: 'get',
  path: '/api/orders',
  tags: ['Orders'],
  summary: 'List Customer Orders',
  description: 'Lists all orders placed by the currently authenticated customer.',
  security: [{ bearerAuth: [] }],
  request: {
    query: z.object({
      status: z.string().optional().openapi({ description: 'Filter by order status', example: 'pending' }),
      search: z.string().optional().openapi({ description: 'Search term for order ID or product names', example: 'mouse' }),
      page: z.coerce.number().optional().openapi({ description: 'Page number', example: 1 }),
      limit: z.coerce.number().optional().openapi({ description: 'Items per page', example: 20 }),
    }),
  },
  responses: {
    200: {
      description: 'Orders list retrieved successfully',
      content: {
        'application/json': {
          schema: z.object({
            data: z.array(z.object({
              _id: z.string().openapi({ example: '607f1f77bcf86cd799439030' }),
              customerId: z.string().openapi({ example: '607f1f77bcf86cd799439011' }),
              sellerIds: z.array(z.string()).openapi({ example: ['607f1f77bcf86cd799439013'] }),
              totalAmount: z.number().openapi({ example: 34.99 }),
              aggregateStatus: z.string().openapi({ example: 'pending' }),
              shippingAddress: z.string().openapi({ example: '607f1f77bcf86cd799439040' }),
              paymentMethod: z.enum(['card', 'cod']).openapi({ example: 'card' }),
              paymentStatus: z.enum(['pending', 'completed', 'failed', 'refunded']).openapi({ example: 'pending' }),
              createdAt: z.string().openapi({ example: '2026-06-16T11:00:00.000Z' }),
            })),
            meta: z.object({
              page: z.number().openapi({ example: 1 }),
              limit: z.number().openapi({ example: 20 }),
              total: z.number().openapi({ example: 1 }),
              totalPages: z.number().openapi({ example: 1 }),
            }),
          }),
        },
      },
    },
    401: authErrorResponse,
    500: internalErrorResponse,
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/orders',
  tags: ['Orders'],
  summary: 'Checkout / Create Order',
  description: 'Creates a new checkout order and atomically decrements inventory. Uses database transactions.',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: createOrderSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Order created successfully',
      content: {
        'application/json': {
          schema: z.object({
            _id: z.string().openapi({ example: '607f1f77bcf86cd799439030' }),
            customerId: z.string().openapi({ example: '607f1f77bcf86cd799439011' }),
            sellerIds: z.array(z.string()).openapi({ example: ['607f1f77bcf86cd799439013'] }),
            totalAmount: z.number().openapi({ example: 34.99 }),
            aggregateStatus: z.string().openapi({ example: 'pending' }),
            shippingAddress: z.string().openapi({ example: '607f1f77bcf86cd799439040' }),
            paymentMethod: z.enum(['card', 'cod']).openapi({ example: 'card' }),
            paymentStatus: z.enum(['pending', 'completed', 'failed', 'refunded']).openapi({ example: 'pending' }),
            createdAt: z.string().openapi({ example: '2026-06-16T11:00:00.000Z' }),
          }),
        },
      },
    },
    400: errorResponse('Stock limit exceeded or validation failed', 'VALIDATION_ERROR'),
    401: authErrorResponse,
    500: internalErrorResponse,
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/orders/{id}',
  tags: ['Orders'],
  summary: 'Order Details',
  description: 'Retrieves details of a specific order including items and status. Restricted to the customer who placed the order or admins.',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ description: 'Order ID', example: '607f1f77bcf86cd799439030' }),
    }),
  },
  responses: {
    200: {
      description: 'Order details and items retrieved successfully',
      content: {
        'application/json': {
          schema: z.object({
            order: z.object({
              _id: z.string().openapi({ example: '607f1f77bcf86cd799439030' }),
              customerId: z.string().openapi({ example: '607f1f77bcf86cd799439011' }),
              sellerIds: z.array(z.string()).openapi({ example: ['607f1f77bcf86cd799439013'] }),
              totalAmount: z.number().openapi({ example: 34.99 }),
              status: z.string().openapi({ example: 'pending' }),
              shippingAddress: z.object({
                _id: z.string().openapi({ example: '607f1f77bcf86cd799439040' }),
                street: z.string().openapi({ example: '123 Main St' }),
                city: z.string().openapi({ example: 'Seattle' }),
                state: z.string().openapi({ example: 'WA' }),
                zip: z.string().openapi({ example: '98101' }),
                country: z.string().openapi({ example: 'USA' }),
              }),
              paymentMethod: z.enum(['card', 'cod']).openapi({ example: 'card' }),
              paymentStatus: z.enum(['pending', 'completed', 'failed', 'refunded']).openapi({ example: 'pending' }),
              createdAt: z.string().openapi({ example: '2026-06-16T11:00:00.000Z' }),
              updatedAt: z.string().openapi({ example: '2026-06-16T11:00:00.000Z' }),
            }),
            items: z.array(z.object({
              _id: z.string().openapi({ example: '607f1f77bcf86cd799439031' }),
              orderId: z.string().openapi({ example: '607f1f77bcf86cd799439030' }),
              productId: z.object({
                _id: z.string().openapi({ example: '607f1f77bcf86cd799439020' }),
                name: z.string().openapi({ example: 'Wireless Mouse' }),
                images: z.array(z.string()).openapi({ example: ['https://example.com/mouse.jpg'] }),
                slug: z.string().openapi({ example: 'wireless-mouse-1623849103' }),
              }),
              variantId: z.string().optional().openapi({ example: '607f1f77bcf86cd799439021' }),
              sellerId: z.string().openapi({ example: '607f1f77bcf86cd799439013' }),
              quantity: z.number().openapi({ example: 1 }),
              price: z.number().openapi({ example: 29.99 }),
              status: z.string().openapi({ example: 'pending' }),
            })),
          }),
        },
      },
    },
    401: authErrorResponse,
    403: forbiddenErrorResponse,
    404: notFoundErrorResponse,
    500: internalErrorResponse,
  },
});

// ---------------------------------------------------------
// 4. Seller Endpoints
// ---------------------------------------------------------

registry.registerPath({
  method: 'get',
  path: '/api/seller/store',
  tags: ['Seller Profile'],
  summary: 'Get Seller Store',
  description: 'Gets details about the store profile assigned to the authenticated seller.',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'Store details retrieved successfully',
      content: {
        'application/json': {
          schema: z.object({
            _id: z.string().openapi({ example: '607f1f77bcf86cd799439050' }),
            sellerId: z.string().openapi({ example: '607f1f77bcf86cd799439013' }),
            storeName: z.string().openapi({ example: 'Super Gizmos' }),
            description: z.string().openapi({ example: 'The best source for electronics' }),
            logo: z.string().openapi({ example: 'https://example.com/logo.jpg' }),
            isApproved: z.boolean().openapi({ example: true }),
            createdAt: z.string().openapi({ example: '2026-06-15T09:00:00.000Z' }),
          }),
        },
      },
    },
    401: authErrorResponse,
    403: forbiddenErrorResponse,
    500: internalErrorResponse,
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/seller/store',
  tags: ['Seller Profile'],
  summary: 'Create Seller Store',
  description: 'Registers the seller store. Restricted to sellers only.',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: createStoreSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Store created successfully',
      content: {
        'application/json': {
          schema: z.object({
            _id: z.string().openapi({ example: '607f1f77bcf86cd799439050' }),
            sellerId: z.string().openapi({ example: '607f1f77bcf86cd799439013' }),
            storeName: z.string().openapi({ example: 'Super Gizmos' }),
            description: z.string().openapi({ example: 'The best source for electronics' }),
            logo: z.string().openapi({ example: 'https://example.com/logo.jpg' }),
            isApproved: z.boolean().openapi({ example: false }),
            createdAt: z.string().openapi({ example: '2026-06-16T12:00:00.000Z' }),
          }),
        },
      },
    },
    400: validationErrorResponse,
    401: authErrorResponse,
    403: forbiddenErrorResponse,
    500: internalErrorResponse,
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/seller/products',
  tags: ['Seller Operations'],
  summary: 'List Seller Products',
  description: 'Returns products listed by the authenticated seller including variant inventory counts.',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'Seller products retrieved successfully',
      content: {
        'application/json': {
          schema: z.array(z.object({
            _id: z.string().openapi({ example: '607f1f77bcf86cd799439020' }),
            name: z.string().openapi({ example: 'Wireless Mouse' }),
            slug: z.string().openapi({ example: 'wireless-mouse-1623849103' }),
            basePrice: z.number().openapi({ example: 29.99 }),
            status: z.string().openapi({ example: 'published' }),
            variants: z.array(z.object({
              _id: z.string().openapi({ example: '607f1f77bcf86cd799439021' }),
              sku: z.string().openapi({ example: 'MSE-WRLS-BLK' }),
              price: z.number().openapi({ example: 29.99 }),
              stock: z.number().openapi({ example: 45 }),
            })),
          })),
        },
      },
    },
    401: authErrorResponse,
    403: forbiddenErrorResponse,
    500: internalErrorResponse,
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/seller/products/{id}/status',
  tags: ['Seller Operations'],
  summary: 'Update Seller Product Status',
  description: 'Allows seller to submit product to pending review or request status transitions.',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ description: 'Product ID', example: '607f1f77bcf86cd799439020' }),
    }),
    body: {
      content: {
        'application/json': {
          schema: productStatusUpdateSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Product status updated',
      content: {
        'application/json': {
          schema: z.object({
            _id: z.string().openapi({ example: '607f1f77bcf86cd799439020' }),
            status: z.string().openapi({ example: 'pending_review' }),
          }),
        },
      },
    },
    400: errorResponse('Invalid transition or validation failed', 'VALIDATION_ERROR'),
    401: authErrorResponse,
    403: forbiddenErrorResponse,
    404: notFoundErrorResponse,
    500: internalErrorResponse,
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/seller/orders',
  tags: ['Seller Operations'],
  summary: 'List Seller Order Items',
  description: 'Lists order line items that are assigned to the authenticated seller store.',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'Seller orders retrieved successfully',
      content: {
        'application/json': {
          schema: z.array(z.object({
            _id: z.string().openapi({ example: '607f1f77bcf86cd799439031' }),
            orderId: z.string().openapi({ example: '607f1f77bcf86cd799439030' }),
            productId: z.object({
              _id: z.string().openapi({ example: '607f1f77bcf86cd799439020' }),
              name: z.string().openapi({ example: 'Wireless Mouse' }),
            }),
            quantity: z.number().openapi({ example: 1 }),
            price: z.number().openapi({ example: 29.99 }),
            status: z.string().openapi({ example: 'pending' }),
            createdAt: z.string().openapi({ example: '2026-06-16T11:00:00.000Z' }),
          })),
        },
      },
    },
    401: authErrorResponse,
    403: forbiddenErrorResponse,
    500: internalErrorResponse,
  },
});

registry.registerPath({
  method: 'put',
  path: '/api/seller/orders/{id}/status',
  tags: ['Seller Operations'],
  summary: 'Update Order Item fulfillment status',
  description: 'Update the fulfillment status of a specific order line item.',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ description: 'Order Item ID', example: '607f1f77bcf86cd799439031' }),
    }),
    body: {
      content: {
        'application/json': {
          schema: orderItemStatusUpdateSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Fulfillment status updated',
      content: {
        'application/json': {
          schema: z.object({
            _id: z.string().openapi({ example: '607f1f77bcf86cd799439031' }),
            status: z.string().openapi({ example: 'processing' }),
          }),
        },
      },
    },
    400: validationErrorResponse,
    401: authErrorResponse,
    403: forbiddenErrorResponse,
    404: notFoundErrorResponse,
    500: internalErrorResponse,
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/seller/dashboard',
  tags: ['Seller Operations'],
  summary: 'Seller Analytics Dashboard',
  description: 'Computes metrics like sales revenue, orders count, and popular products.',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'Dashboard stats compiled successfully',
      content: {
        'application/json': {
          schema: z.object({
            revenue: z.number().openapi({ example: 450.75 }),
            ordersCount: z.number().openapi({ example: 12 }),
            popularProducts: z.array(z.object({
              name: z.string().openapi({ example: 'Wireless Mouse' }),
              salesCount: z.number().openapi({ example: 8 }),
            })),
          }),
        },
      },
    },
    401: authErrorResponse,
    403: forbiddenErrorResponse,
    500: internalErrorResponse,
  },
});

// ---------------------------------------------------------
// 5. Admin Endpoints
// ---------------------------------------------------------

registry.registerPath({
  method: 'get',
  path: '/api/admin/products',
  tags: ['Admin Management'],
  summary: 'List All Products (Moderation)',
  description: 'Provides admin view over all products in any status.',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'Retrieval successful',
      content: {
        'application/json': {
          schema: z.array(z.object({
            _id: z.string().openapi({ example: '607f1f77bcf86cd799439020' }),
            name: z.string().openapi({ example: 'Wireless Mouse' }),
            status: z.string().openapi({ example: 'pending_review' }),
            sellerId: z.string().openapi({ example: '607f1f77bcf86cd799439013' }),
            createdAt: z.string().openapi({ example: '2026-06-16T12:00:00.000Z' }),
          })),
        },
      },
    },
    401: authErrorResponse,
    403: forbiddenErrorResponse,
    500: internalErrorResponse,
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/admin/products/{id}/status',
  tags: ['Admin Management'],
  summary: 'Approve or Reject Product',
  description: 'Moderates a product status (e.g. approve to publish, or reject).',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ description: 'Product ID', example: '607f1f77bcf86cd799439020' }),
    }),
    body: {
      content: {
        'application/json': {
          schema: productStatusUpdateSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Product moderated successfully',
      content: {
        'application/json': {
          schema: z.object({
            _id: z.string().openapi({ example: '607f1f77bcf86cd799439020' }),
            status: z.string().openapi({ example: 'published' }),
          }),
        },
      },
    },
    400: errorResponse('Invalid transition or validation failed', 'VALIDATION_ERROR'),
    401: authErrorResponse,
    403: forbiddenErrorResponse,
    404: notFoundErrorResponse,
    500: internalErrorResponse,
  },
});

// ---------------------------------------------------------
// 6. Payments Endpoints
// ---------------------------------------------------------

registry.registerPath({
  method: 'post',
  path: '/api/payments/create-intent',
  tags: ['Payments'],
  summary: 'Create Payment Intent',
  description: 'Creates a Stripe PaymentIntent to initiate Stripe Checkout.',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            orderId: z.string().openapi({ example: '607f1f77bcf86cd799439030' }),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'PaymentIntent created successfully',
      content: {
        'application/json': {
          schema: z.object({
            clientSecret: z.string().openapi({ example: 'pi_3J4x9v2eZvKYlo2C1abcde_secret_fghij' }),
          }),
        },
      },
    },
    400: errorResponse('Invalid order or order already paid', 'VALIDATION_ERROR'),
    401: authErrorResponse,
    500: internalErrorResponse,
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/payments/webhook',
  tags: ['Payments'],
  summary: 'Stripe Webhook',
  description: 'Stripe event webhook handler (authenticates with Stripe signatures). Handles events like payment_intent.succeeded.',
  responses: {
    200: {
      description: 'Stripe Event processed successfully',
      content: {
        'application/json': {
          schema: z.object({
            received: z.boolean().openapi({ example: true }),
          }),
        },
      },
    },
    400: errorResponse('Webhook Signature validation failed', 'VALIDATION_ERROR'),
    500: internalErrorResponse,
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/payments/onboarding',
  tags: ['Payments'],
  summary: 'Stripe Connect Onboarding',
  description: 'Generates account links for Stripe Connect seller onboarding.',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'Account link generated successfully',
      content: {
        'application/json': {
          schema: z.object({
            url: z.string().openapi({ example: 'https://connect.stripe.com/setup/s/acct_123abc' }),
          }),
        },
      },
    },
    401: authErrorResponse,
    403: forbiddenErrorResponse,
    500: internalErrorResponse,
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/payments/payout-status',
  tags: ['Payments'],
  summary: 'Get Seller Payout Status',
  description: 'Gets Connect payout configurations (e.g. payout capability active states).',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'Payout status retrieved successfully',
      content: {
        'application/json': {
          schema: z.object({
            payoutsEnabled: z.boolean().openapi({ example: true }),
            chargesEnabled: z.boolean().openapi({ example: true }),
            detailsSubmitted: z.boolean().openapi({ example: true }),
          }),
        },
      },
    },
    401: authErrorResponse,
    403: forbiddenErrorResponse,
    500: internalErrorResponse,
  },
});

// ---------------------------------------------------------
// 7. Categories
// ---------------------------------------------------------

registry.registerPath({
  method: 'get',
  path: '/api/categories',
  tags: ['Categories'],
  summary: 'List Categories',
  description: 'Gets parent/child categories list (public).',
  responses: {
    200: {
      description: 'Categories list compiled successfully',
      content: {
        'application/json': {
          schema: z.array(z.object({
            _id: z.string().openapi({ example: '607f1f77bcf86cd799439014' }),
            name: z.string().openapi({ example: 'Electronics' }),
            slug: z.string().openapi({ example: 'electronics' }),
            parentId: z.string().optional().openapi({ example: null }),
            image: z.string().optional().openapi({ example: 'https://example.com/cat.jpg' }),
          })),
        },
      },
    },
    500: internalErrorResponse,
  },
});

// ---------------------------------------------------------
// 8. Addresses Endpoints
// ---------------------------------------------------------

registry.registerPath({
  method: 'get',
  path: '/api/addresses',
  tags: ['Addresses'],
  summary: 'List Addresses',
  description: 'Retrieves all saved billing and shipping addresses for the currently authenticated user.',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'Addresses retrieved successfully',
      content: {
        'application/json': {
          schema: z.object({
            data: z.array(
              z.object({
                _id: z.string().openapi({ example: '607f1f77bcf86cd799439040' }),
                userId: z.string().openapi({ example: '607f1f77bcf86cd799439011' }),
                type: z.enum(['billing', 'shipping']).openapi({ example: 'shipping' }),
                street: z.string().openapi({ example: '123 Main St' }),
                city: z.string().openapi({ example: 'Seattle' }),
                state: z.string().openapi({ example: 'WA' }),
                zip: z.string().openapi({ example: '98101' }),
                country: z.string().openapi({ example: 'USA' }),
                isDefault: z.boolean().openapi({ example: true }),
                createdAt: z.string().openapi({ example: '2026-06-15T09:00:00.000Z' }),
                updatedAt: z.string().openapi({ example: '2026-06-15T09:00:00.000Z' }),
              })
            ),
          }),
        },
      },
    },
    401: authErrorResponse,
    500: internalErrorResponse,
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/addresses',
  tags: ['Addresses'],
  summary: 'Create Address',
  description: 'Creates a new address for the currently authenticated user.',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: createAddressSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Address created successfully',
      content: {
        'application/json': {
          schema: z.object({
            data: z.object({
              _id: z.string().openapi({ example: '607f1f77bcf86cd799439040' }),
              userId: z.string().openapi({ example: '607f1f77bcf86cd799439011' }),
              type: z.enum(['billing', 'shipping']).openapi({ example: 'shipping' }),
              street: z.string().openapi({ example: '123 Main St' }),
              city: z.string().openapi({ example: 'Seattle' }),
              state: z.string().openapi({ example: 'WA' }),
              zip: z.string().openapi({ example: '98101' }),
              country: z.string().openapi({ example: 'USA' }),
              isDefault: z.boolean().openapi({ example: false }),
              createdAt: z.string().openapi({ example: '2026-06-16T12:00:00.000Z' }),
              updatedAt: z.string().openapi({ example: '2026-06-16T12:00:00.000Z' }),
            }),
          }),
        },
      },
    },
    400: validationErrorResponse,
    401: authErrorResponse,
    500: internalErrorResponse,
  },
});

registry.registerPath({
  method: 'put',
  path: '/api/addresses/{id}',
  tags: ['Addresses'],
  summary: 'Update Address',
  description: 'Updates an existing address details. Restricted to the address owner.',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ description: 'Address ID', example: '607f1f77bcf86cd799439040' }),
    }),
    body: {
      content: {
        'application/json': {
          schema: createAddressSchema.partial(),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Address updated successfully',
      content: {
        'application/json': {
          schema: z.object({
            data: z.object({
              _id: z.string().openapi({ example: '607f1f77bcf86cd799439040' }),
              userId: z.string().openapi({ example: '607f1f77bcf86cd799439011' }),
              type: z.enum(['billing', 'shipping']).openapi({ example: 'shipping' }),
              street: z.string().openapi({ example: '456 Broadway Ave' }),
              city: z.string().openapi({ example: 'Seattle' }),
              state: z.string().openapi({ example: 'WA' }),
              zip: z.string().openapi({ example: '98102' }),
              country: z.string().openapi({ example: 'USA' }),
              isDefault: z.boolean().openapi({ example: true }),
              createdAt: z.string().openapi({ example: '2026-06-15T09:00:00.000Z' }),
              updatedAt: z.string().openapi({ example: '2026-06-16T12:00:00.000Z' }),
            }),
          }),
        },
      },
    },
    400: errorResponse('Validation failed or invalid ID format', 'VALIDATION_ERROR'),
    401: authErrorResponse,
    403: forbiddenErrorResponse,
    404: notFoundErrorResponse,
    500: internalErrorResponse,
  },
});

registry.registerPath({
  method: 'delete',
  path: '/api/addresses/{id}',
  tags: ['Addresses'],
  summary: 'Delete Address',
  description: 'Deletes an existing address. Restricted to the address owner.',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ description: 'Address ID', example: '607f1f77bcf86cd799439040' }),
    }),
  },
  responses: {
    200: {
      description: 'Address deleted successfully',
      content: {
        'application/json': {
          schema: z.object({
            message: z.string().openapi({ example: 'Address deleted successfully' }),
          }),
        },
      },
    },
    400: errorResponse('Invalid ID format', 'VALIDATION_ERROR'),
    401: authErrorResponse,
    403: forbiddenErrorResponse,
    404: notFoundErrorResponse,
    500: internalErrorResponse,
  },
});

export const GET = withErrorHandler(async () => {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  const document = generator.generateDocument({
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'Nexus Marketplace API',
      description: 'Official production-grade interactive API documentation for the Nexus Marketplace.',
    },
    servers: [{ url: 'http://localhost:3000' }],
  });

  return NextResponse.json(document);
});
