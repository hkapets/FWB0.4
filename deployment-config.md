# Cloud Run Deployment Configuration

## Fixes Applied

### 1. Port Configuration
- Updated server to default to port 8080 (Cloud Run standard)
- Server now properly uses PORT environment variable
- Removed multiple port configurations (Cloud Run supports only one external port)

### 2. Image Size Reduction
- Created .dockerignore to exclude unnecessary files from build
- Excluded development files, documentation, and Electron-specific files
- Build process now excludes heavy dependencies not needed in production

### 3. Health Check
- Added /api/health endpoint for Cloud Run health monitoring
- Dockerfile includes health check configuration

### 4. Production Optimizations
- Dockerfile uses Node.js 20 Alpine for smaller image size
- Non-root user for security
- Production-only dependencies installed

## Required Manual Steps

Since .replit file cannot be modified programmatically, the user needs to:

1. Update .replit port configuration to single port:
```
[[ports]]
localPort = 80
externalPort = 80
```

2. Update waitForPort to match:
```
waitForPort = 80
```

3. Remove multiple port configurations that cause Cloud Run conflicts

## Deployment Ready
- Server configured for Cloud Run PORT environment variable
- Health check endpoint available
- Image size optimized with .dockerignore
- Production-ready Dockerfile created