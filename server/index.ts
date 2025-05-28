import express, { type Request, Response, NextFunction } from 'express';
import { registerRoutes } from './routes';
import { setupVite, serveStatic, log } from './vite';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Validate DATABASE_URL before using it
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  throw new Error(
    'DATABASE_URL must be set. Did you forget to provision a database?'
  );
}

// Additional validation for empty or whitespace-only values
const databaseUrl = process.env.DATABASE_URL.trim();
if (!databaseUrl) {
  console.error('DATABASE_URL is empty or contains only whitespace');
  throw new Error('DATABASE_URL cannot be empty');
}

console.log('DATABASE_URL is set, length:', databaseUrl.length);
console.log('DATABASE_URL starts with:', databaseUrl.substring(0, 20) + '...');

// Check for common issues
if (databaseUrl === 'undefined' || databaseUrl === 'null') {
  console.error(
    'DATABASE_URL appears to be a string literal "undefined" or "null"'
  );
  throw new Error('DATABASE_URL is not properly set in the environment');
}

// Validate DATABASE_URL format
try {
  new URL(databaseUrl);
  console.log('DATABASE_URL format validation passed');
} catch (error) {
  console.error('Invalid DATABASE_URL format:', databaseUrl);
  console.error('URL parsing error:', error);
  throw new Error(
    'DATABASE_URL must be a valid URL format (e.g., postgresql://user:password@host:port/database)'
  );
}

// Set up session middleware
const PGStore = connectPgSimple(session);

let sessionStore;
try {
  // For Neon databases, ensure SSL is properly configured
  let connectionString = databaseUrl;

  // If it's a Neon database URL, ensure it has proper SSL settings
  if (
    connectionString.includes('neon.tech') ||
    connectionString.includes('neon.database')
  ) {
    const url = new URL(connectionString);
    if (!url.searchParams.has('sslmode')) {
      url.searchParams.set('sslmode', 'require');
      connectionString = url.toString();
      console.log('Added SSL mode to Neon database URL');
    }
  }

  console.log('Attempting to create PostgreSQL session store...');
  sessionStore = new PGStore({
    conString: connectionString,
    tableName: 'user_sessions',
    createTableIfMissing: true,
    // Add additional options for better compatibility
    errorLog: (error: any) => {
      console.error('PGStore error:', error);
    },
  });
  console.log('PostgreSQL session store initialized successfully');
} catch (error) {
  console.error('Failed to initialize PostgreSQL session store:', error);
  console.log('Falling back to MemoryStore for sessions');

  // Fallback to memory store in production (not ideal but prevents crashes)
  sessionStore = new session.MemoryStore();
}

app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'aspire-emv-calculator-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
    },
    genid: () => {
      return require('crypto').randomBytes(16).toString('hex');
    },
  })
);

// For demo purposes, create a mock user session if it doesn't exist
app.use((req: Request, res: Response, next: NextFunction) => {
  if (!req.session.user) {
    req.session.user = {
      id: 'demo-user-1',
      username: 'demo_user',
    };
  }
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on('finish', () => {
    const duration = Date.now() - start;
    if (path.startsWith('/api')) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + '…';
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Test the session store connection before starting the server
    if (sessionStore && typeof sessionStore.get === 'function') {
      try {
        // Test the session store by attempting a simple operation
        await new Promise((resolve, reject) => {
          sessionStore.get('test-session-id', (err: any, session: any) => {
            if (
              err &&
              err.code !== 'ENOENT' &&
              !err.message.includes('does not exist')
            ) {
              console.error('Session store test failed:', err);
              reject(err);
            } else {
              console.log('Session store test passed');
              resolve(session);
            }
          });
        });
      } catch (error) {
        console.warn(
          'Session store test failed, but continuing with fallback:',
          error
        );
      }
    }

    const server = await registerRoutes(app);

    // Enhanced error handler that prevents crashes
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || 'Internal Server Error';

      if (!res.headersSent) {
        res.status(status).json({ message });
      }
      console.error('Server error handled:', message);
    });

    // Add global error handlers to prevent crashes
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      // Don't exit - keep server running
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      // Don't exit - keep server running
    });

    // Setup vite/static serving
    if (app.get('env') === 'development') {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    const port = 8080;
    server.listen(
      {
        port,
        host: '0.0.0.0',
        reusePort: true,
      },
      () => {
        log(`serving on port ${port}`);
      }
    );
  } catch (error) {
    console.error('Failed to start server:', error);
    // Exit only on startup failure
    process.exit(1);
  }
})();
