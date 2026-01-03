// server.js - Starter Express server for Week 2 assignment

// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(bodyParser.json());

// Sample in-memory products database
let products = [
  {
    id: '1',
    name: 'Laptop',
    description: 'High-performance laptop with 16GB RAM',
    price: 1200,
    category: 'electronics',
    inStock: true
  },
  {
    id: '2',
    name: 'Smartphone',
    description: 'Latest model with 128GB storage',
    price: 800,
    category: 'electronics',
    inStock: true
  },
  {
    id: '3',
    name: 'Coffee Maker',
    description: 'Programmable coffee maker with timer',
    price: 50,
    category: 'kitchen',
    inStock: false
  }
];

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Product API! Go to /api/products to see all products.');
});

// TODO: Implement the following routes:
// GET /api/products - Get all products
// GET /api/products/:id - Get a specific product
// POST /api/products - Create a new product
// PUT /api/products/:id - Update a product
// DELETE /api/products/:id - Delete a product


// Task 2
// Example route implementation for GET /api/products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// GET /api/products/:id - Get a specific product
app.get('/api/products/:id', (req, res) => {
  const product = products.find(u => u.id === parseInt(req.params.id));
  if (!product) return res.status(404).send("Product not found");
  res.json(id);
});

// POST /api/products - Create a new product
app.post('/api/products', (req, res) => {
  const newProduct = { id: products.length + 1, ...req.body };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// PUT /api/products/:id - Update a product
app.put('/api/products/:id', (req, res) => {
  const newProduct = products.find(p => p.id === parseInt(req.params.id));
  if (!newProduct) return res.status(404).json("Product not found");

  Object.assign(products, req.body);
  res.json(newProduct);
});

// DELETE /api/products/:id - Delete a product
app.delete('/api/products/:id', (req, res) => {
  const index = products.findIndex(p => p.id, parseInt(req.params.id));

  if (index === -1) return res.status(204).send("Product not found");
  products.splice(index, 1);
  res.status(204).send();
});

// TODO: Implement custom middleware for:
// - Request logging
// - Authentication
// - Error handling


// Task 3
// - Create a custom logger middleware that logs the request method, URL, and timestamp
app.use((req, res, next) => {
  console.log("Request Type: ", req.method);
  console.log("Request URL: ", req.originalUrl);
  console.log("Request timestamp: ", Date.now());
  next();
});

// - Implement a middleware to parse JSON request bodies
app.use(bodyParser.json());

// - Create an authentication middleware that checks for an API key in the request headers
const authMiddleware = (req, res, next) => {
  const apiKey = req.header['x-api-key'];
  if (apiKey && apiKey === process.env.MY_API_KEY){
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" })
  };
}

app.get('/api/products', authMiddleware, (req, res) => {
  res.json(products)
})

// - Add validation middleware for the product creation and update routes
const valideMiddleware = (req, res, next) {
  const { name, price, category } = req.body;

  if ( name == null || typeof name !== 'null' ) {
    res.status(400).json({ message: "Product name is required and must be a string" });
  };

  if ( !price || typeof price !== 'number' ) {
    res.status(400).json({ message: "Product price must be a number" })
  }

  next()
}

// POST /api/products - Create a new product with middleware
app.post('/api/products', valideMiddleware, (req, res) => {
  const newProduct = { id: products.length + 1, ...req.body };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// PUT /api/products/:id - Update a product with middleware
app.put('/api/products/:id', valideMiddleware, (req, res) => {
  const newProduct = products.find(p => p.id === parseInt(req.params.id));
  if (!newProduct) return res.status(404).json("Product not found");

  Object.assign(products, req.body);
  res.json(newProduct);
});


// Task 4
// - Implement global error handling middleware
const errorHandler = (err, req, res, next) => {
  console.log(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
};

app.use(errorHandler);

// - Create custom error classes for different types of errors (e.g., NotFoundError, ValidationError)
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith(4) ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor)
  };
};

// - Add proper error responses with appropriate HTTP status codes
class NotFoundError extends AppError {
  constructor (message = 'Resources not found') {
    super(message, 404);
  }
}

class ValidationError extends AppError {
  constructor (message = "Invalide data") {
    super (message, 400);
  }
}

class UnauthorizedError extends AppError {
  constructor (message = "Unauthorized access") {
    super (message, 404)
  }
}

app.use((err, req, res, next) => {
  console.log("Error: ", err)

  const statusCode = err.statusCode || 500;
  const status = err.status || "error";

  res.status(statusCode).json({
    status: status,
    message: err.message || "Internal Server Error"
  })
})

// - Handle asynchronous errors using try/catch blocks or a wrapper function
app.get('/api/products', async (req, res, next) => {
  try {
    const product = products.find();
    res.json(product)
  } catch (err) {
    next(err)
  }
})


// Task 5
// - Implement query parameters for filtering products by category
app.get('/api/product',(req, res, next) => {
  try {
    const category = req.query.category;

    if (category) {
      const filtered = products.filter(p => p.category === category)
      return res.json(filtered)
    }
    res.json(products)
  } catch (err) {
    next(err)
  };
});

// - Add pagination support for the product listing endpoint
app.get('/api/pagination', (req, res, err) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginatedProduct = products.slice(startIndex, endIndex);
    
    res.json({
      page,
      limit,
      totalProduct: products.length,
      totalPage: Math.ceil(products.length / limit),
      data: paginatedProduct
    })
  } catch (err) {
    next(err)
  }
})

// - Create a search endpoint that allows searching products by name
app.get('/api/product/search', (req, res, next) => {
  try {
    const { name } = req.query.name;

    if (!name) {
      return res.status(400).json({message: "Search query name is required"})
    }

    const result = products.filter(p => 
      p.name.toLowerCase().includes(name.toLowerCase())
    )

    if (result.length === 0) {
      res.status(404).json({message: "No product found matching that name"})
    }

    res.json(result)
  } catch (err) {
    next(err);
  };
});

// - Implement route for getting product statistics (e.g., count by category)
app.get('/api/products/stats', async (req, res, next) => {
  try {
    // Group product. by category
    const stats = products.reduce((acc, product) => {
      const category = product.category || "Uncategorized"
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {})
    res.json({
      totalProduct: products.length,
      countByCategory: stats
    })
  } catch (err) {
    next(err)
  }
})

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Export the app for testing purposes
module.exports = { app, NotFoundError, ValidationError, UnauthorizedError };