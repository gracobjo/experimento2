# 🛒 Guía Completa: Extensión E-Commerce y Carrito de Compras

## 🎯 Objetivo

Esta guía detalla cómo extender el sistema de gestión legal para incluir funcionalidades completas de **e-commerce**, **carrito de compras** y **pagos online**, transformándolo en una plataforma versátil que puede gestionar tanto servicios legales como una tienda online completa.

## 🏗️ Arquitectura Propuesta

### **Modelos de Base de Datos Nuevos**

#### **1. Product/Service Model**
```sql
-- Tabla: Product
- id: UUID (PK)
- name: String (Nombre del producto/servicio)
- description: Text (Descripción detallada)
- price: Decimal (Precio unitario)
- currency: String (EUR, USD, etc.)
- category: String (Servicios Legales, Productos, etc.)
- type: String (product, service, consultation)
- isActive: Boolean
- stock: Int (Para productos físicos)
- imageUrl: String (URL de imagen)
- tags: String[] (Etiquetas para búsqueda)
- createdAt: DateTime
- updatedAt: DateTime
```

#### **2. Cart Model**
```sql
-- Tabla: Cart
- id: UUID (PK)
- userId: UUID (FK a User)
- status: String (active, pending, completed, cancelled)
- totalAmount: Decimal
- currency: String
- createdAt: DateTime
- updatedAt: DateTime
```

#### **3. CartItem Model**
```sql
-- Tabla: CartItem
- id: UUID (PK)
- cartId: UUID (FK a Cart)
- productId: UUID (FK a Product)
- quantity: Int
- unitPrice: Decimal
- totalPrice: Decimal
- createdAt: DateTime
- updatedAt: DateTime
```

#### **4. Order Model**
```sql
-- Tabla: Order
- id: UUID (PK)
- userId: UUID (FK a User)
- cartId: UUID (FK a Cart)
- orderNumber: String (Número único de orden)
- status: String (pending, paid, shipped, delivered, cancelled)
- totalAmount: Decimal
- currency: String
- shippingAddress: Json
- billingAddress: Json
- paymentMethod: String (paypal, stripe, bank_transfer)
- paymentStatus: String (pending, completed, failed)
- notes: Text
- createdAt: DateTime
- updatedAt: DateTime
```

#### **5. Payment Model**
```sql
-- Tabla: Payment
- id: UUID (PK)
- orderId: UUID (FK a Order)
- amount: Decimal
- currency: String
- method: String (paypal, stripe, bank_transfer)
- status: String (pending, completed, failed, refunded)
- transactionId: String (ID de transacción externa)
- gatewayResponse: Json (Respuesta del gateway de pago)
- createdAt: DateTime
- updatedAt: DateTime
```

## 🔧 Implementación Backend

### **1. Nuevos DTOs**

#### **Product DTOs**
```typescript
// create-product.dto.ts
export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsString()
  @IsIn(['EUR', 'USD', 'GBP'])
  currency: string;

  @IsString()
  category: string;

  @IsString()
  @IsIn(['product', 'service', 'consultation'])
  type: string;

  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

// update-product.dto.ts
export class UpdateProductDto extends PartialType(CreateProductDto) {}
```

#### **Cart DTOs**
```typescript
// add-to-cart.dto.ts
export class AddToCartDto {
  @IsUUID()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

// update-cart-item.dto.ts
export class UpdateCartItemDto {
  @IsNumber()
  @Min(1)
  quantity: number;
}
```

#### **Order DTOs**
```typescript
// create-order.dto.ts
export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  orderNumber: string;

  @IsObject()
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };

  @IsObject()
  billingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };

  @IsString()
  @IsIn(['paypal', 'stripe', 'bank_transfer'])
  paymentMethod: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
```

### **2. Nuevos Servicios**

#### **ProductService**
```typescript
// product.service.ts
@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    return this.prisma.product.create({
      data: createProductDto,
    });
  }

  async findAll(filters?: {
    category?: string;
    type?: string;
    isActive?: boolean;
    search?: string;
  }) {
    const where: any = {};
    
    if (filters?.category) where.category = filters.category;
    if (filters?.type) where.type = filters.type;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { tags: { hasSome: [filters.search] } },
      ];
    }

    return this.prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async remove(id: string) {
    return this.prisma.product.delete({
      where: { id },
    });
  }
}
```

#### **CartService**
```typescript
// cart.service.ts
@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getOrCreateCart(userId: string) {
    let cart = await this.prisma.cart.findFirst({
      where: { userId, status: 'active' },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: {
          userId,
          status: 'active',
          totalAmount: 0,
          currency: 'EUR',
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    }

    return cart;
  }

  async addToCart(userId: string, addToCartDto: AddToCartDto) {
    const cart = await this.getOrCreateCart(userId);
    const product = await this.prisma.product.findUnique({
      where: { id: addToCartDto.productId },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    if (product.type === 'product' && product.stock < addToCartDto.quantity) {
      throw new BadRequestException('Stock insuficiente');
    }

    // Verificar si el producto ya está en el carrito
    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: addToCartDto.productId,
      },
    });

    if (existingItem) {
      // Actualizar cantidad
      const newQuantity = existingItem.quantity + addToCartDto.quantity;
      const updatedItem = await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: newQuantity,
          totalPrice: product.price * newQuantity,
        },
        include: { product: true },
      });

      await this.updateCartTotal(cart.id);
      return updatedItem;
    } else {
      // Agregar nuevo item
      const newItem = await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: addToCartDto.productId,
          quantity: addToCartDto.quantity,
          unitPrice: product.price,
          totalPrice: product.price * addToCartDto.quantity,
        },
        include: { product: true },
      });

      await this.updateCartTotal(cart.id);
      return newItem;
    }
  }

  async updateCartItem(userId: string, itemId: string, updateCartItemDto: UpdateCartItemDto) {
    const cart = await this.getOrCreateCart(userId);
    
    const item = await this.prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cartId: cart.id,
      },
      include: { product: true },
    });

    if (!item) {
      throw new NotFoundException('Item no encontrado en el carrito');
    }

    if (item.product.type === 'product' && item.product.stock < updateCartItemDto.quantity) {
      throw new BadRequestException('Stock insuficiente');
    }

    const updatedItem = await this.prisma.cartItem.update({
      where: { id: itemId },
      data: {
        quantity: updateCartItemDto.quantity,
        totalPrice: item.unitPrice * updateCartItemDto.quantity,
      },
      include: { product: true },
    });

    await this.updateCartTotal(cart.id);
    return updatedItem;
  }

  async removeFromCart(userId: string, itemId: string) {
    const cart = await this.getOrCreateCart(userId);
    
    await this.prisma.cartItem.deleteMany({
      where: {
        id: itemId,
        cartId: cart.id,
      },
    });

    await this.updateCartTotal(cart.id);
  }

  async clearCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    
    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    await this.updateCartTotal(cart.id);
  }

  private async updateCartTotal(cartId: string) {
    const items = await this.prisma.cartItem.findMany({
      where: { cartId },
    });

    const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

    await this.prisma.cart.update({
      where: { id: cartId },
      data: { totalAmount },
    });
  }
}
```

#### **OrderService**
```typescript
// order.service.ts
@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private paymentService: PaymentService,
  ) {}

  async createOrder(userId: string, createOrderDto: CreateOrderDto) {
    const cart = await this.prisma.cart.findFirst({
      where: { userId, status: 'active' },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Carrito vacío');
    }

    // Crear orden
    const order = await this.prisma.order.create({
      data: {
        userId,
        cartId: cart.id,
        orderNumber: createOrderDto.orderNumber,
        status: 'pending',
        totalAmount: cart.totalAmount,
        currency: cart.currency,
        shippingAddress: createOrderDto.shippingAddress,
        billingAddress: createOrderDto.billingAddress,
        paymentMethod: createOrderDto.paymentMethod,
        notes: createOrderDto.notes,
      },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    // Actualizar carrito
    await this.prisma.cart.update({
      where: { id: cart.id },
      data: { status: 'pending' },
    });

    // Crear registro de pago
    await this.prisma.payment.create({
      data: {
        orderId: order.id,
        amount: order.totalAmount,
        currency: order.currency,
        method: order.paymentMethod,
        status: 'pending',
      },
    });

    return order;
  }

  async processPayment(orderId: string, paymentData: any) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }

    // Procesar pago con el gateway correspondiente
    const paymentResult = await this.paymentService.processPayment(
      order.paymentMethod,
      paymentData,
      order.totalAmount,
    );

    // Actualizar estado de pago
    await this.prisma.payment.update({
      where: { orderId },
      data: {
        status: paymentResult.success ? 'completed' : 'failed',
        transactionId: paymentResult.transactionId,
        gatewayResponse: paymentResult.response,
      },
    });

    // Actualizar estado de orden
    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: paymentResult.success ? 'paid' : 'cancelled',
        paymentStatus: paymentResult.success ? 'completed' : 'failed',
      },
    });

    return paymentResult;
  }

  async getUserOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: { product: true },
        },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
```

### **3. Nuevos Controladores**

#### **ProductController**
```typescript
// product.controller.ts
@Controller('products')
@ApiTags('Products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Crear nuevo producto/servicio' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los productos/servicios' })
  findAll(@Query() filters: any) {
    return this.productService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener producto/servicio por ID' })
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Actualizar producto/servicio' })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Eliminar producto/servicio' })
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }
}
```

#### **CartController**
```typescript
// cart.controller.ts
@Controller('cart')
@UseGuards(JwtAuthGuard)
@ApiTags('Cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener carrito del usuario' })
  getCart(@Request() req) {
    return this.cartService.getOrCreateCart(req.user.id);
  }

  @Post('add')
  @ApiOperation({ summary: 'Agregar producto al carrito' })
  addToCart(@Request() req, @Body() addToCartDto: AddToCartDto) {
    return this.cartService.addToCart(req.user.id, addToCartDto);
  }

  @Patch('items/:id')
  @ApiOperation({ summary: 'Actualizar cantidad de item en carrito' })
  updateCartItem(
    @Request() req,
    @Param('id') id: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(req.user.id, id, updateCartItemDto);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Eliminar item del carrito' })
  removeFromCart(@Request() req, @Param('id') id: string) {
    return this.cartService.removeFromCart(req.user.id, id);
  }

  @Delete('clear')
  @ApiOperation({ summary: 'Vaciar carrito' })
  clearCart(@Request() req) {
    return this.cartService.clearCart(req.user.id);
  }
}
```

#### **OrderController**
```typescript
// order.controller.ts
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiTags('Orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nueva orden' })
  createOrder(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    return this.orderService.createOrder(req.user.id, createOrderDto);
  }

  @Post(':id/payment')
  @ApiOperation({ summary: 'Procesar pago de orden' })
  processPayment(
    @Param('id') id: string,
    @Body() paymentData: any,
  ) {
    return this.orderService.processPayment(id, paymentData);
  }

  @Get('my-orders')
  @ApiOperation({ summary: 'Obtener órdenes del usuario' })
  getUserOrders(@Request() req) {
    return this.orderService.getUserOrders(req.user.id);
  }

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Obtener todas las órdenes (Admin)' })
  getAllOrders() {
    return this.orderService.getAllOrders();
  }
}
```

## 🎨 Implementación Frontend

### **1. Nuevas Páginas**

#### **ProductCatalogPage.tsx**
```typescript
// frontend/src/pages/ProductCatalogPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  type: string;
  imageUrl?: string;
  tags: string[];
}

const ProductCatalogPage: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    type: '',
    search: '',
  });

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/products', { params: filters });
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      await axios.post('/api/cart/add', {
        productId,
        quantity,
      });
      alert('Producto agregado al carrito');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Error al agregar al carrito');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🛍️ Catálogo de Productos y Servicios</h1>
          <p className="mt-2 text-gray-600">
            Explora nuestros productos y servicios legales
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Todas las categorías</option>
                <option value="Servicios Legales">Servicios Legales</option>
                <option value="Consultoría">Consultoría</option>
                <option value="Documentos">Documentos</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Todos los tipos</option>
                <option value="service">Servicios</option>
                <option value="product">Productos</option>
                <option value="consultation">Consultas</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Buscar productos..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Productos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {product.imageUrl && (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {product.description}
                </p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-blue-600">
                    {product.price} {product.currency}
                  </span>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {product.type}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mb-4">
                  {product.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => addToCart(product.id)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  🛒 Agregar al Carrito
                </button>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No se encontraron productos</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCatalogPage;
```

#### **CartPage.tsx**
```typescript
// frontend/src/pages/CartPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

interface CartItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: {
    id: string;
    name: string;
    description: string;
    imageUrl?: string;
  };
}

interface Cart {
  id: string;
  totalAmount: number;
  currency: string;
  items: CartItem[];
}

const CartPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/cart');
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      await axios.patch(`/api/cart/items/${itemId}`, { quantity });
      fetchCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      await axios.delete(`/api/cart/items/${itemId}`);
      fetchCart();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const clearCart = async () => {
    if (!confirm('¿Estás seguro de que quieres vaciar el carrito?')) return;
    
    try {
      await axios.delete('/api/cart/clear');
      fetchCart();
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const proceedToCheckout = () => {
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🛒 Tu carrito está vacío</h2>
            <p className="text-gray-600 mb-8">
              Agrega algunos productos o servicios para comenzar
            </p>
            <button
              onClick={() => navigate('/products')}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              🛍️ Ir al Catálogo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🛒 Carrito de Compras</h1>
          <p className="mt-2 text-gray-600">
            Revisa tus productos y servicios seleccionados
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de productos */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Productos ({cart.items.length})
                  </h2>
                  <button
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    🗑️ Vaciar Carrito
                  </button>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {cart.items.map((item) => (
                  <div key={item.id} className="p-6">
                    <div className="flex items-center">
                      {item.product.imageUrl && (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded-md mr-4"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          {item.product.name}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {item.product.description}
                        </p>
                        <p className="text-gray-900 font-medium mt-1">
                          {item.unitPrice} {cart.currency} por unidad
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center border border-gray-300 rounded-md">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                          >
                            -
                          </button>
                          <span className="px-3 py-1 text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            {item.totalPrice} {cart.currency}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Resumen */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Resumen del Pedido
              </h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{cart.totalAmount} {cart.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Impuestos:</span>
                  <span className="font-medium">0.00 {cart.currency}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">Total:</span>
                    <span className="text-lg font-bold text-gray-900">
                      {cart.totalAmount} {cart.currency}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={proceedToCheckout}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                💳 Proceder al Pago
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
```

### **2. Integración con Pagos**

#### **PaymentService**
```typescript
// payment.service.ts
@Injectable()
export class PaymentService {
  async processPayment(method: string, paymentData: any, amount: number) {
    switch (method) {
      case 'paypal':
        return this.processPayPalPayment(paymentData, amount);
      case 'stripe':
        return this.processStripePayment(paymentData, amount);
      case 'bank_transfer':
        return this.processBankTransfer(paymentData, amount);
      default:
        throw new BadRequestException('Método de pago no soportado');
    }
  }

  private async processPayPalPayment(paymentData: any, amount: number) {
    // Implementar integración con PayPal
    // Usar PayPal SDK o API REST
    try {
      // Lógica de PayPal aquí
      return {
        success: true,
        transactionId: 'paypal_' + Date.now(),
        response: { status: 'completed' },
      };
    } catch (error) {
      return {
        success: false,
        transactionId: null,
        response: { error: error.message },
      };
    }
  }

  private async processStripePayment(paymentData: any, amount: number) {
    // Implementar integración con Stripe
    try {
      // Lógica de Stripe aquí
      return {
        success: true,
        transactionId: 'stripe_' + Date.now(),
        response: { status: 'completed' },
      };
    } catch (error) {
      return {
        success: false,
        transactionId: null,
        response: { error: error.message },
      };
    }
  }

  private async processBankTransfer(paymentData: any, amount: number) {
    // Procesar transferencia bancaria
    return {
      success: true,
      transactionId: 'bank_' + Date.now(),
      response: { 
        status: 'pending',
        instructions: 'Transferir a cuenta bancaria: ES91 2100 0418 4502 0005 1332',
      },
    };
  }
}
```

## 🔧 Configuración del Sistema

### **1. Variables de Entorno**
```env
# PayPal Configuration
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Bank Transfer Configuration
BANK_ACCOUNT_NUMBER=ES91 2100 0418 4502 0005 1332
BANK_ACCOUNT_HOLDER=Despacho Legal S.L.
```

### **2. Configuraciones del Sitio**
```typescript
// Configuraciones adicionales para e-commerce
const ecommerceConfigs = [
  // Configuraciones de pago
  {
    key: 'paypal_enabled',
    value: 'true',
    type: 'boolean',
    category: 'payment',
    description: 'Habilitar pagos con PayPal',
    isPublic: false,
  },
  {
    key: 'stripe_enabled',
    value: 'true',
    type: 'boolean',
    category: 'payment',
    description: 'Habilitar pagos con Stripe',
    isPublic: false,
  },
  {
    key: 'bank_transfer_enabled',
    value: 'true',
    type: 'boolean',
    category: 'payment',
    description: 'Habilitar transferencias bancarias',
    isPublic: true,
  },
  {
    key: 'currency_default',
    value: 'EUR',
    type: 'string',
    category: 'payment',
    description: 'Moneda por defecto',
    isPublic: true,
  },
  {
    key: 'tax_rate',
    value: '21',
    type: 'string',
    category: 'payment',
    description: 'Tasa de impuestos (%)',
    isPublic: false,
  },
  {
    key: 'shipping_enabled',
    value: 'false',
    type: 'boolean',
    category: 'shipping',
    description: 'Habilitar envíos físicos',
    isPublic: true,
  },
  {
    key: 'free_shipping_threshold',
    value: '50',
    type: 'string',
    category: 'shipping',
    description: 'Umbral para envío gratuito (€)',
    isPublic: true,
  },
];
```

## 🚀 Ejemplos Prácticos

### **Ejemplo 1: Agregar Servicio Legal**
```typescript
// Crear servicio de consulta legal
const consultationService = {
  name: "Consulta Legal Inicial",
  description: "Sesión de 30 minutos para evaluar tu caso legal",
  price: 50.00,
  currency: "EUR",
  category: "Servicios Legales",
  type: "consultation",
  isActive: true,
  tags: ["consulta", "legal", "asesoramiento"],
};
```

### **Ejemplo 2: Agregar Producto Físico**
```typescript
// Crear producto físico
const legalDocument = {
  name: "Contrato de Arrendamiento",
  description: "Plantilla legal de contrato de arrendamiento",
  price: 25.00,
  currency: "EUR",
  category: "Documentos",
  type: "product",
  isActive: true,
  stock: 100,
  imageUrl: "/images/contract-template.jpg",
  tags: ["contrato", "arrendamiento", "plantilla"],
};
```

### **Ejemplo 3: Configurar Menú de Tienda**
```typescript
// Agregar menú de tienda para clientes
const storeMenuItems = [
  {
    label: "🛍️ Tienda",
    url: "/store",
    icon: "🛍️",
    order: 1,
    isVisible: true,
    isExternal: false,
  },
  {
    label: "🛒 Mi Carrito",
    url: "/cart",
    icon: "🛒",
    order: 2,
    isVisible: true,
    isExternal: false,
  },
  {
    label: "📦 Mis Pedidos",
    url: "/orders",
    icon: "📦",
    order: 3,
    isVisible: true,
    isExternal: false,
  },
];
```

## 📊 Beneficios de la Extensión

### **Para el Negocio**
1. **Diversificación**: Vender productos y servicios adicionales
2. **Automatización**: Procesos de pago automáticos
3. **Escalabilidad**: Fácil agregar nuevos productos/servicios
4. **Análisis**: Datos de ventas y comportamiento de clientes

### **Para los Clientes**
1. **Conveniencia**: Comprar servicios legales online
2. **Transparencia**: Precios claros y visibles
3. **Flexibilidad**: Múltiples métodos de pago
4. **Accesibilidad**: Catálogo disponible 24/7

### **Para los Desarrolladores**
1. **Modularidad**: Sistema extensible y mantenible
2. **Reutilización**: Componentes compartidos
3. **Integración**: APIs de pago estándar
4. **Escalabilidad**: Arquitectura preparada para crecimiento

## ✅ Estado de Implementación

Esta extensión e-commerce está **diseñada y documentada** para ser implementada sobre el sistema existente. Incluye:

- ✅ **Arquitectura completa**: Modelos, servicios, controladores
- ✅ **Frontend responsive**: Páginas de catálogo y carrito
- ✅ **Integración de pagos**: PayPal, Stripe, transferencias
- ✅ **Configuración dinámica**: A través del sistema existente
- ✅ **Documentación detallada**: Guías y ejemplos prácticos

**¡El sistema está preparado para transformarse en una plataforma de e-commerce completa!** 🚀 