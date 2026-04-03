const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

// Environment setup
const NODE_ENV = process.env.NODE_ENV || 'development';
if (NODE_ENV === 'development') {
  try {
    require('dotenv').config({ path: './config.env' });
  } catch (error) {
    console.warn('config.env not found, using process environment variables');
  }
}

// Verify critical environment variables
if (!process.env.JWT_SECRET) {
  console.error('❌ CRITICAL: JWT_SECRET is not defined in environment variables!');
  console.error('Please add JWT_SECRET to your config.env file');
  process.exit(1);
}

console.log('✅ JWT_SECRET is configured');
console.log('✅ JWT_EXPIRES_IN:', process.env.JWT_EXPIRES_IN);

const ATLAS_URI = process.env.ATLAS_URI;
const PORT = process.env.PORT || 6003;

// CORS setup
app.use(cors({
  origin: [
    "https://medicwaycare-com.onrender.com",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://72.62.187.221:5173",
    "https://v-web-five.vercel.app",
    "https://v-web-frontend-flame.vercel.app",
    "https://v-web-frontend-s8pe.vercel.app",
    "https://v-web-frontend-gaci.vercel.app",
    "https://v-web-frontend-beta.vercel.app"
  ],
  credentials: true
}));

app.use(express.json());

// MongoDB connection
const connectDB = async () => {
  const maxRetries = 3;
  let attempts = 0;
  while (attempts < maxRetries) {
    try {
      if (!ATLAS_URI) {
        throw new Error('ATLAS_URI environment variable is not defined');
      }
      await mongoose.connect(ATLAS_URI, {
        dbName: 'healthcare',
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        retryWrites: true,
        w: 'majority'
      });
      console.log('MongoDB connected successfully');
      return;
    } catch (err) {
      attempts++;
      console.error(`Mongoose connection attempt ${attempts} failed:`, err.message);
      if (attempts >= maxRetries) {
        console.error('Max retries reached. Could not connect to MongoDB.');
        throw err;
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};

// Load main routes
app.use("/api/v1", require("./route/main.routes"));

// Explicitly load routes
try {
  const aboutRoute = require('./routes/about.cjs');
  app.use('/api/about', aboutRoute);
} catch (error) {
  console.error('✗ Failed to load route about:', error.message);
}

try {
  const headingsRoute = require('./routes/headings.cjs');
  app.use('/api/headings', headingsRoute);
} catch (error) {
  console.error('✗ Failed to load route headings:', error.message);
}

try {
  const languageRoute = require('./routes/language.cjs');
  app.use('/api/language', languageRoute);
} catch (error) {
  console.error('✗ Failed to load route language:', error.message);
}

try {
  const collectionsRoute = require('./routes/collections.cjs');
  app.use('/api/collections', collectionsRoute);
} catch (error) {
  console.error('✗ Failed to load route collections:', error.message);
}

try {
  const servicesRoute = require('./routes/services.cjs');
  app.use('/api/services', servicesRoute);
} catch (error) {
  console.error('✗ Failed to load route services:', error.message);
}

try {
  const hospitalsRoute = require('./routes/hospitals.cjs');
  app.use('/api/hospitals', hospitalsRoute);
} catch (error) {
  console.error('✗ Failed to load route hospitals:', error.message);
}

try {
  const procedureCostsRoute = require('./routes/procedureCosts.cjs');
  app.use('/api/procedure-costs', procedureCostsRoute);
} catch (error) {
  console.error('✗ Failed to load route procedure-costs:', error.message);
}

try {
  const patientOpinionsRoute = require('./routes/patientOpinion.cjs');
  app.use('/api/patient-opinions', patientOpinionsRoute);
} catch (error) {
  console.error('✗ Failed to load route patient-opinions:', error.message);
}

try {
  const faqsRoute = require('./routes/faqs.cjs');
  app.use('/api/faqs', faqsRoute);
} catch (error) {
  console.error('✗ Failed to load route faqs:', error.message);
}

try {
  const assistanceRoute = require('./routes/assistance.cjs');
  app.use('/api/assistance', assistanceRoute);
} catch (error) {
  console.error('✗ Failed to load route assistance:', error.message);
}

try {
  const doctorsRoute = require('./routes/doctor.cjs');
  app.use('/api/doctors', doctorsRoute);
} catch (error) {
  console.error('✗ Failed to load route doctors:', error.message);
}

try {
  const treatmentsRoute = require('./routes/treatments.cjs');
  app.use('/api/treatments', treatmentsRoute);
} catch (error) {
  console.error('✗ Failed to load route treatments:', error.message);
}

try {
  const doctorTreatmentsRoute = require('./routes/doctorTreatments.cjs');
  app.use('/api/doctor-treatment', doctorTreatmentsRoute);
} catch (error) {
  console.error('✗ Failed to load route doctor-treatment:', error.message);
}

try {
  const hospitalTreatmentsRoute = require('./routes/hospitalTreatments.cjs');
  app.use('/api/hospital-treatment', hospitalTreatmentsRoute);
} catch (error) {
  console.error('✗ Failed to load route hospital-treatment:', error.message);
}

try {
  const contactRoute = require('./routes/contact.cjs');
  app.use('/api/contact', contactRoute);
} catch (error) {
  console.error('✗ Failed to load route contact:', error.message);
}

// FIX: Mount admin and blog routes properly
try {
  const adminRoute = require('./routes/admin.cjs');
  app.use('/api/v1/admin', adminRoute);
  // Also support legacy frontend path and direct calls:
  app.use('/api/admin', adminRoute);
} catch (error) {
  console.error('✗ Failed to load route admin:', error.message);
}

try {
  const blogRoute = require('./routes/blog.cjs');
  app.use('/api/v1/blogs', blogRoute);
} catch (error) {
  console.error('✗ Failed to load route blogs:', error.message);
}

// OPTION 1: If you need /api/v1/admin/blogs endpoint, create a combined route
// Uncomment this if you specifically need admin blogs endpoint
/*
try {
  const adminBlogsRoute = require('./routes/adminBlogs.cjs');
  app.use('/api/v1/admin/blogs', adminBlogsRoute);
} catch (error) {
  console.error('✗ Failed to load route admin blogs:', error.message);
}
*/

// OPTION 2: Alternatively, mount blog routes under admin as well
// This makes blogs accessible at both /api/v1/blogs AND /api/v1/admin/blogs
try {
  const blogRoute = require('./routes/blog.cjs');
  app.use('/api/v1/admin/blogs', blogRoute); // Mount same blog routes under admin path
  console.log('✓ Blog routes mounted at /api/v1/admin/blogs');
} catch (error) {
  console.error('✗ Failed to mount blog routes under admin:', error.message);
}

try {
  const uploadRoute = require('./routes/upload.cjs');
  app.use('/api/upload', uploadRoute);
} catch (error) {
  console.error('✗ Failed to load route upload:', error.message);
}

try {
  const patientsRoute = require('./routes/patient.cjs');
  app.use('/api/patients', patientsRoute);
} catch (error) {
  console.error('✗ Failed to load route patients:', error.message);
}

try {
  const seoRoute = require('./routes/seo.cjs');
  app.use('/api/v1/seo', seoRoute);
} catch (error) {
  console.error('✗ Failed to load route seo:', error.message);
}

// Static files
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

// Health check endpoints
app.get('/', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  res.json({
    status: 'Server running successfully',
    dbStatus: dbStatus === 1 ? 'Connected' : 'Disconnected',
    environment: NODE_ENV
  });
});

app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  res.json({
    status: 'API is running',
    dbStatus: dbStatus === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// Debug endpoint to test token verification
app.get('/api/v1/admin/test-auth', (req, res) => {
  const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;
  
  res.json({
    debug: true,
    tokenPresent: !!token,
    authHeaderPresent: !!req.headers.authorization,
    jwtSecretConfigured: !!process.env.JWT_SECRET,
    message: 'Use this to verify your token is being sent correctly'
  });
});

// 404 handler for unmatched API routes
app.use('/api/:unmatchedRoute', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.originalUrl,
    attemptedRoute: req.params.unmatchedRoute,
    availableRoutes: [
      '/api/v1/admin/*',
      '/api/v1/blogs/*',
      '/api/v1/seo/*',
      '/api/about',
      '/api/headings',
      '/api/language',
      '/api/collections',
      '/api/services',
      '/api/hospitals',
      '/api/procedure-costs',
      '/api/patient-opinions',
      '/api/faqs',
      '/api/assistance',
      '/api/doctors',
      '/api/treatments',
      '/api/doctor-treatment',
      '/api/hospital-treatment',
      '/api/contact',
      '/api/upload',
      '/api/patients'
    ]
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: NODE_ENV === 'production' ? 'Please try again later' : error.message
  });
});

const handler = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    try {
      // await connectDB();
    } catch (error) {
      console.error('Database connection failed in handler:', error.message);
      return res.status(500).json({
        error: 'Database connection failed',
        message: 'Please try again later'
      });
    }
  }
  return app(req, res);
};

module.exports = handler;

// Start server in non-production environment
if (NODE_ENV !== 'production') {
  const startServer = async () => {
    try {
      await connectDB();

      const Content = require('./models/Content.cjs');
      try {
        const indexes = await Content.collection.indexes();
        if (indexes.some((index) => index.name === 'page_1')) {
          await Content.collection.dropIndex('page_1');
          console.log('Dropped legacy Content page index');
        }
      } catch (indexErr) {
        if (indexErr.codeName !== 'IndexNotFound' && indexErr.message.indexOf('ns not found') === -1) {
          console.warn('Content index cleanup failed:', indexErr.message);
        }
      }

      try {
        await Content.syncIndexes();
        console.log('Content indexes synchronized');
      } catch (syncErr) {
        console.warn('Content syncIndexes failed:', syncErr.message);
      }

      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Available API endpoints:`);
        console.log(`  - http://localhost:${PORT}/api/v1/admin/*`);
        console.log(`  - http://localhost:${PORT}/api/v1/blogs/*`);
        console.log(`  - http://localhost:${PORT}/api/v1/admin/blogs/* (mounted from blog routes)`);
      });
    } catch (err) {
      console.error('Server startup failed:', err);
      process.exit(1);
    }
  };
  
  process.on('SIGINT', async () => {
    await mongoose.disconnect();
    console.log('Mongoose connection closed');
    process.exit(0);
  });
  
  startServer();
}