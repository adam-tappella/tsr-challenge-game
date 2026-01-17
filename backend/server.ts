import express, { Express, Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

import type {
  ClientToServerEvents,
  ServerToClientEvents,
  AdminToServerEvents,
  GameState,
  RoundNumber,
} from './types/game.js';

import {
  DEFAULT_GAME_CONFIG,
  WEBSOCKET_SETTINGS,
  validateDecisionConfiguration,
  getDecisionsForRound,
} from './config/index.js';

import {
  initializeGameStateManager,
} from './game-state-manager.js';

// Load environment variables
dotenv.config();

const app: Express = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

// Forward declaration for io (needed by game manager callbacks)
let io: Server<ClientToServerEvents & AdminToServerEvents, ServerToClientEvents>;

// =============================================================================
// Game State Manager Initialization
// =============================================================================

const gameManager = initializeGameStateManager({
  onStateChange: (state: GameState) => {
    if (io) io.emit('game-state-update', state);
  },
  onTimerTick: (secondsRemaining: number) => {
    if (io) io.emit('timer-tick', secondsRemaining);
  },
  onRoundEnd: () => {
    const state = gameManager.getState();
    const roundResults = gameManager.getLastRoundResults();
    console.log(`[Game] Round ${state.currentRound} ended`);
    
    if (io && roundResults) {
      io.emit('round-end', roundResults);
      console.log(`[Game] Round ${state.currentRound} results calculated:`);
      console.log(`  - Teams ranked: ${roundResults.teamResults.length}`);
      console.log(`  - Risky outcomes: ${roundResults.riskyOutcomes.length}`);
      if (roundResults.teamResults.length > 0) {
        const leader = roundResults.teamResults[0];
        console.log(`  - Leader: Team ${leader.teamId} with ${(leader.cumulativeTSR * 100).toFixed(2)}% TSR`);
      }
    }
  },
  onGameEnd: () => {
    const finalResults = gameManager.getFinalResults();
    console.log('[Game] Game finished');
    
    if (io && finalResults) {
      io.emit('game-end', finalResults);
      console.log(`[Game] Final results calculated:`);
      console.log(`  - Winner: Team ${finalResults.winnerId}`);
      console.log(`  - Teams in leaderboard: ${finalResults.leaderboard.length}`);
      if (finalResults.leaderboard.length > 0) {
        const winner = finalResults.leaderboard[0];
        console.log(`  - Winning TSR: ${(winner.totalTSR * 100).toFixed(2)}%`);
        console.log(`  - Final stock price: $${winner.finalStockPrice.toFixed(2)}`);
      }
    }
  },
});

// =============================================================================
// Socket.IO Setup
// =============================================================================

io = new Server<ClientToServerEvents & AdminToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingInterval: WEBSOCKET_SETTINGS.pingInterval,
  pingTimeout: WEBSOCKET_SETTINGS.pingTimeout,
});

// =============================================================================
// Middleware
// =============================================================================

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

if (process.env.NODE_ENV !== 'production') {
  app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`${new Date().toISOString()} | ${req.method} ${req.path}`);
    next();
  });
}

// =============================================================================
// Health Check
// =============================================================================

app.get('/api/health', (_req: Request, res: Response) => {
  const configValidation = validateDecisionConfiguration();
  const state = gameManager.getState();
  
  res.json({
    status: configValidation.valid ? 'healthy' : 'warning',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    websocket: { connected: io.engine.clientsCount },
    game: {
      status: state.status,
      currentRound: state.currentRound,
      teamsClaimed: Object.values(state.teams).filter(t => t.isClaimed).length,
      teamsTotal: state.teamCount,
    },
    config: { valid: configValidation.valid, errors: configValidation.errors },
  });
});

// =============================================================================
// Public API Routes
// =============================================================================

app.get('/api', (_req: Request, res: Response) => {
  res.json({
    name: 'Magna TSR Challenge API',
    version: '0.2.0',
    documentation: '/api/docs',
    gameConfig: {
      teamCount: DEFAULT_GAME_CONFIG.teamCount,
      roundDurationSeconds: DEFAULT_GAME_CONFIG.roundDurationSeconds,
    },
  });
});

app.get('/api/config', (_req: Request, res: Response) => {
  const state = gameManager.getState();
  res.json({
    teamCount: state.teamCount,
    roundDurationSeconds: state.roundDuration,
    totalRounds: 5,
  });
});

app.get('/api/game-state', (_req: Request, res: Response) => {
  res.json(gameManager.getState());
});

app.get('/api/decisions/:round', (req: Request, res: Response) => {
  const round = parseInt(req.params.round, 10) as RoundNumber;
  if (isNaN(round) || round < 1 || round > 5) {
    return res.status(400).json({ error: 'Invalid round number. Must be 1-5.' });
  }
  res.json(getDecisionsForRound(round));
});

app.get('/api/results/round', (_req: Request, res: Response) => {
  const results = gameManager.getLastRoundResults();
  if (results) {
    res.json(results);
  } else {
    res.status(404).json({ error: 'No round results available yet' });
  }
});

app.get('/api/results/final', (_req: Request, res: Response) => {
  const results = gameManager.getFinalResults();
  if (results) {
    res.json(results);
  } else {
    res.status(404).json({ error: 'Game not finished yet' });
  }
});

// =============================================================================
// Admin/Facilitator API Routes
// =============================================================================

app.post('/admin/auth', (req: Request, res: Response) => {
  const { pin } = req.body;
  if (!pin) return res.status(400).json({ success: false, error: 'PIN required' });
  
  const isValid = pin === DEFAULT_GAME_CONFIG.adminPin;
  if (isValid) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, error: 'Invalid PIN' });
  }
});

app.post('/admin/config', (req: Request, res: Response) => {
  const { pin, teamCount, roundDurationSeconds } = req.body;
  if (pin !== DEFAULT_GAME_CONFIG.adminPin) {
    return res.status(401).json({ success: false, error: 'Invalid admin PIN' });
  }
  
  const errors: string[] = [];
  if (teamCount !== undefined) {
    const result = gameManager.configureTeamCount(teamCount);
    if (!result.success) errors.push(result.error || 'Failed to configure team count');
  }
  if (roundDurationSeconds !== undefined) {
    const result = gameManager.configureRoundDuration(roundDurationSeconds);
    if (!result.success) errors.push(result.error || 'Failed to configure round duration');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }
  res.json({ success: true, state: gameManager.getState() });
});

app.post('/admin/start-game', (req: Request, res: Response) => {
  const { pin } = req.body;
  if (pin !== DEFAULT_GAME_CONFIG.adminPin) {
    return res.status(401).json({ success: false, error: 'Invalid admin PIN' });
  }
  
  const result = gameManager.startGame();
  if (result.success) {
    const state = gameManager.getState();
    io.emit('round-start', state.currentRound, gameManager.getAvailableDecisions());
    res.json({ success: true, message: 'Game started', state });
  } else {
    res.status(400).json({ success: false, error: result.error });
  }
});

app.post('/admin/pause', (req: Request, res: Response) => {
  const { pin } = req.body;
  if (pin !== DEFAULT_GAME_CONFIG.adminPin) {
    return res.status(401).json({ success: false, error: 'Invalid admin PIN' });
  }
  
  const result = gameManager.pauseRound();
  if (result.success) {
    res.json({ success: true, message: 'Round paused', state: gameManager.getState() });
  } else {
    res.status(400).json({ success: false, error: result.error });
  }
});

app.post('/admin/resume', (req: Request, res: Response) => {
  const { pin } = req.body;
  if (pin !== DEFAULT_GAME_CONFIG.adminPin) {
    return res.status(401).json({ success: false, error: 'Invalid admin PIN' });
  }
  
  const result = gameManager.resumeRound();
  if (result.success) {
    res.json({ success: true, message: 'Round resumed', state: gameManager.getState() });
  } else {
    res.status(400).json({ success: false, error: result.error });
  }
});

app.post('/admin/end-round', (req: Request, res: Response) => {
  const { pin } = req.body;
  if (pin !== DEFAULT_GAME_CONFIG.adminPin) {
    return res.status(401).json({ success: false, error: 'Invalid admin PIN' });
  }
  
  const result = gameManager.endRound();
  if (result.success) {
    res.json({ success: true, message: 'Round ended', state: gameManager.getState() });
  } else {
    res.status(400).json({ success: false, error: result.error });
  }
});

app.post('/admin/next-round', (req: Request, res: Response) => {
  const { pin } = req.body;
  if (pin !== DEFAULT_GAME_CONFIG.adminPin) {
    return res.status(401).json({ success: false, error: 'Invalid admin PIN' });
  }
  
  const result = gameManager.nextRound();
  if (result.success) {
    const state = gameManager.getState();
    if (state.status === 'active') {
      io.emit('round-start', state.currentRound, gameManager.getAvailableDecisions());
      res.json({ success: true, message: `Round ${state.currentRound} started`, state });
    } else {
      res.json({ success: true, message: 'Game completed', state });
    }
  } else {
    res.status(400).json({ success: false, error: result.error });
  }
});

app.post('/admin/trigger-event', (req: Request, res: Response) => {
  const { pin, eventType } = req.body;
  if (pin !== DEFAULT_GAME_CONFIG.adminPin) {
    return res.status(401).json({ success: false, error: 'Invalid admin PIN' });
  }
  if (!eventType) {
    return res.status(400).json({ success: false, error: 'eventType required' });
  }
  
  const result = gameManager.triggerEvent(eventType);
  if (result.success) {
    io.emit('scenario-event', eventType);
    res.json({ success: true, message: `Event triggered: ${eventType}`, state: gameManager.getState() });
  } else {
    res.status(400).json({ success: false, error: result.error });
  }
});

app.post('/admin/reset', (req: Request, res: Response) => {
  const { pin } = req.body;
  if (pin !== DEFAULT_GAME_CONFIG.adminPin) {
    return res.status(401).json({ success: false, error: 'Invalid admin PIN' });
  }
  
  gameManager.resetGame();
  res.json({ success: true, message: 'Game reset to lobby', state: gameManager.getState() });
});

app.get('/admin/status', (req: Request, res: Response) => {
  const pin = req.query.pin as string;
  if (pin !== DEFAULT_GAME_CONFIG.adminPin) {
    return res.status(401).json({ success: false, error: 'Invalid admin PIN' });
  }
  
  const state = gameManager.getState();
  const teamsInfo = gameManager.getTeamsSubmissionInfo();
  
  res.json({
    success: true,
    status: state.status,
    currentRound: state.currentRound,
    roundTimeRemaining: state.roundTimeRemaining,
    scenario: state.scenario,
    teams: teamsInfo,
    teamsSubmitted: teamsInfo.filter(t => t.hasSubmitted).length,
    teamsClaimed: teamsInfo.filter(t => t.isClaimed).length,
    teamsTotal: state.teamCount,
  });
});

// =============================================================================
// WebSocket Event Handlers
// =============================================================================

io.on('connection', (socket: Socket<ClientToServerEvents & AdminToServerEvents, ServerToClientEvents>) => {
  console.log(`[Socket] Client connected: ${socket.id}`);
  
  // Send current state to newly connected client
  socket.emit('game-state-update', gameManager.getState());

  // ===== Team Events =====
  
  socket.on('join-game', (teamId: number, callback: (success: boolean, error?: string) => void) => {
    console.log(`[Socket] Team ${teamId} attempting to join from ${socket.id}`);
    const result = gameManager.joinGame(teamId, socket.id);
    
    if (result.success) {
      socket.join(`team-${teamId}`);
      io.emit('team-joined', teamId);
      console.log(`[Socket] Team ${teamId} joined successfully`);
    }
    callback(result.success, result.error);
  });

  socket.on('submit-decisions', (decisions: string[], callback: (success: boolean, error?: string) => void) => {
    console.log(`[Socket] Decisions submitted: ${decisions.length} decisions from ${socket.id}`);
    const result = gameManager.submitDecisions(socket.id, decisions);
    
    if (result.success && result.teamId) {
      io.emit('team-submitted', result.teamId);
      console.log(`[Socket] Team ${result.teamId} submitted ${decisions.length} decisions`);
    }
    callback(result.success, result.error);
  });

  socket.on('toggle-decision', (decisionId: string, selected: boolean) => {
    gameManager.toggleDecision(socket.id, decisionId, selected);
  });

  // ===== Admin Events =====
  
  socket.on('admin-auth', (pin: string, callback: (success: boolean) => void) => {
    const isValid = pin === DEFAULT_GAME_CONFIG.adminPin;
    console.log(`[Socket] Admin auth attempt: ${isValid ? 'success' : 'failed'}`);
    if (isValid) socket.join('admin');
    callback(isValid);
  });

  socket.on('config-teams', (count: number) => {
    console.log(`[Socket] Team count configured: ${count}`);
    const result = gameManager.configureTeamCount(count);
    if (!result.success) console.log(`[Socket] Config failed: ${result.error}`);
  });

  socket.on('start-game', () => {
    console.log('[Socket] Game start requested');
    const result = gameManager.startGame();
    if (result.success) {
      const state = gameManager.getState();
      io.emit('round-start', state.currentRound, gameManager.getAvailableDecisions());
    } else {
      console.log(`[Socket] Start failed: ${result.error}`);
    }
  });

  socket.on('pause-round', () => {
    console.log('[Socket] Round pause requested');
    const result = gameManager.pauseRound();
    if (!result.success) console.log(`[Socket] Pause failed: ${result.error}`);
  });

  socket.on('resume-round', () => {
    console.log('[Socket] Round resume requested');
    const result = gameManager.resumeRound();
    if (!result.success) console.log(`[Socket] Resume failed: ${result.error}`);
  });

  socket.on('end-round', () => {
    console.log('[Socket] Round end requested');
    const result = gameManager.endRound();
    if (!result.success) console.log(`[Socket] End round failed: ${result.error}`);
  });

  socket.on('next-round', () => {
    console.log('[Socket] Next round requested');
    const result = gameManager.nextRound();
    if (result.success) {
      const state = gameManager.getState();
      if (state.status === 'active') {
        io.emit('round-start', state.currentRound, gameManager.getAvailableDecisions());
      }
    } else {
      console.log(`[Socket] Next round failed: ${result.error}`);
    }
  });

  socket.on('trigger-event', (eventType: string) => {
    console.log(`[Socket] Event triggered: ${eventType}`);
    const result = gameManager.triggerEvent(eventType);
    if (result.success) {
      io.emit('scenario-event', eventType);
    } else {
      console.log(`[Socket] Trigger event failed: ${result.error}`);
    }
  });

  // ===== Disconnect =====
  
  socket.on('disconnect', (reason: string) => {
    console.log(`[Socket] Client disconnected: ${socket.id} (${reason})`);
    const result = gameManager.handleDisconnect(socket.id);
    if (result.teamId !== null) {
      console.log(`[Socket] Team ${result.teamId} disconnected (can reconnect)`);
    }
  });
});

// =============================================================================
// Error Handling
// =============================================================================

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource does not exist',
  });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
  });
});

// =============================================================================
// Server Startup
// =============================================================================

httpServer.listen(PORT, () => {
  console.log(`\n🎮 Magna TSR Challenge Server`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🌐 HTTP:      http://localhost:${PORT}`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
  console.log(`📊 Health:    http://localhost:${PORT}/api/health`);
  console.log(`⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
  
  const configValidation = validateDecisionConfiguration();
  if (configValidation.valid) {
    console.log(`✅ Decision configuration: Valid (75 cards)`);
  } else {
    console.log(`⚠️  Decision configuration errors:`);
    configValidation.errors.forEach(e => console.log(`   - ${e}`));
  }
  
  console.log(`\n📋 Admin Endpoints:`);
  console.log(`   POST /admin/auth        - Verify PIN`);
  console.log(`   POST /admin/config      - Set team count/duration`);
  console.log(`   POST /admin/start-game  - Begin Round 1`);
  console.log(`   POST /admin/pause       - Pause round`);
  console.log(`   POST /admin/resume      - Resume round`);
  console.log(`   POST /admin/end-round   - Force end round`);
  console.log(`   POST /admin/next-round  - Advance to next round`);
  console.log(`   POST /admin/trigger-event - Trigger scenario event`);
  console.log(`   POST /admin/reset       - Reset to lobby`);
  console.log(`   GET  /admin/status      - Get status with teams`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
});

export default app;
export { io, httpServer };
