import { Router, Request, Response, NextFunction } from 'express';

const router = Router();

// =============================================================================
// Types
// =============================================================================

interface ResourceItem {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateResourceBody {
  name: string;
}

interface UpdateResourceBody {
  name?: string;
}

// =============================================================================
// Route Handlers
// =============================================================================

/**
 * GET /api/resources
 * List all resources with optional filtering
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = 50, offset = 0, search } = req.query;
    
    // TODO: Replace with actual database query
    const resources: ResourceItem[] = [];
    
    res.json({
      data: resources,
      pagination: {
        limit: Number(limit),
        offset: Number(offset),
        total: resources.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/resources/:id
 * Get a single resource by ID
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // TODO: Replace with actual database query
    const resource: ResourceItem | null = null;
    
    if (!resource) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Resource with id '${id}' not found`,
      });
    }
    
    res.json({ data: resource });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/resources
 * Create a new resource
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body: CreateResourceBody = req.body;
    
    // Validation
    if (!body.name || typeof body.name !== 'string') {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'name is required and must be a string',
      });
    }
    
    // TODO: Replace with actual database insert
    const newResource: ResourceItem = {
      id: crypto.randomUUID(),
      name: body.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    res.status(201).json({ data: newResource });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/resources/:id
 * Update an existing resource
 */
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const body: UpdateResourceBody = req.body;
    
    // TODO: Replace with actual database query
    const existingResource: ResourceItem | null = null;
    
    if (!existingResource) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Resource with id '${id}' not found`,
      });
    }
    
    // TODO: Replace with actual database update
    const updatedResource: ResourceItem = {
      ...existingResource,
      ...body,
      updatedAt: new Date(),
    };
    
    res.json({ data: updatedResource });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/resources/:id
 * Delete a resource
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // TODO: Replace with actual database query
    const existingResource: ResourceItem | null = null;
    
    if (!existingResource) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Resource with id '${id}' not found`,
      });
    }
    
    // TODO: Replace with actual database delete
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export { router as resourceRoutes };
