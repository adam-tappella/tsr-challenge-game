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
  BASELINE_FINANCIALS,
  WACC,
  NET_DEBT,
  MINORITY_INTEREST,
  INVESTED_CAPITAL,
  createInitialMetrics,
} from './config/baseline-financials.js';

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

// CORS configuration - supports multiple origins for dev and production
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177'];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(allowed => origin.startsWith(allowed) || allowed === '*')) {
      callback(null, true);
    } else {
      console.log(`[CORS] Blocked origin: ${origin}`);
      callback(null, true); // Allow anyway for now during testing
    }
  },
  methods: ['GET', 'POST'],
  credentials: true,
};

io = new Server<ClientToServerEvents & AdminToServerEvents, ServerToClientEvents>(httpServer, {
  cors: corsOptions,
  pingInterval: WEBSOCKET_SETTINGS.pingInterval,
  pingTimeout: WEBSOCKET_SETTINGS.pingTimeout,
});

// =============================================================================
// Middleware
// =============================================================================

app.use(cors(corsOptions));

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

// Temporary endpoint to view t=0 baseline state
app.get('/t0', (_req: Request, res: Response) => {
  const initialMetrics = createInitialMetrics();
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>T=0 Baseline State</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; background: #f5f5f5; }
        h1 { color: #333; border-bottom: 3px solid #4CAF50; padding-bottom: 10px; }
        .section { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h2 { color: #4CAF50; margin-top: 0; }
        table { width: 100%; border-collapse: collapse; }
        tr { border-bottom: 1px solid #eee; }
        td { padding: 10px 0; }
        td:first-child { font-weight: 600; color: #555; }
        td:last-child { text-align: right; font-family: 'Courier New', monospace; }
        .highlight { background: #ffffcc; }
      </style>
    </head>
    <body>
      <h1>T=0 Baseline Financial State</h1>
      
      <div class="section">
        <h2>Income Statement</h2>
        <table>
          <tr><td>Revenue</td><td>$${initialMetrics.revenue.toLocaleString()}M</td></tr>
          <tr><td>COGS</td><td>$${initialMetrics.cogs.toLocaleString()}M</td></tr>
          <tr><td>SG&A</td><td>$${initialMetrics.sga.toLocaleString()}M</td></tr>
          <tr><td>EBITDA</td><td>$${initialMetrics.ebitda.toLocaleString()}M</td></tr>
          <tr><td>Depreciation</td><td>$${initialMetrics.depreciation.toLocaleString()}M</td></tr>
          <tr><td>Amortization</td><td>$${initialMetrics.amortization.toLocaleString()}M</td></tr>
          <tr class="highlight"><td>EBIT</td><td>$${initialMetrics.ebit.toLocaleString()}M</td></tr>
        </table>
      </div>

      <div class="section">
        <h2>Valuation</h2>
        <table>
          <tr class="highlight"><td>NPV / Enterprise Value</td><td>$${initialMetrics.npv.toLocaleString()}M</td></tr>
          <tr><td>Net Debt</td><td>$${NET_DEBT.toLocaleString()}M</td></tr>
          <tr><td>Minority Interest</td><td>$${MINORITY_INTEREST.toLocaleString()}M</td></tr>
          <tr class="highlight"><td>Equity Value</td><td>$${initialMetrics.equityValue.toLocaleString()}M</td></tr>
          <tr><td>Shares Outstanding</td><td>${initialMetrics.sharesOutstanding.toLocaleString()}M</td></tr>
          <tr class="highlight"><td>Share Price</td><td>$${initialMetrics.sharePrice.toFixed(2)}</td></tr>
        </table>
      </div>

      <div class="section">
        <h2>Performance Metrics</h2>
        <table>
          <tr><td>Invested Capital</td><td>$${initialMetrics.investedCapital.toLocaleString()}M</td></tr>
          <tr><td>WACC</td><td>${(WACC * 100).toFixed(2)}%</td></tr>
          <tr class="highlight"><td>ROIC</td><td>${(initialMetrics.roic * 100).toFixed(2)}%</td></tr>
          <tr><td>EBITDA Margin</td><td>${(initialMetrics.ebitdaMargin * 100).toFixed(2)}%</td></tr>
          <tr><td>EBIT Margin</td><td>${(initialMetrics.ebitMargin * 100).toFixed(2)}%</td></tr>
          <tr><td>COGS / Revenue</td><td>${(initialMetrics.cogsToRevenue * 100).toFixed(2)}%</td></tr>
          <tr><td>SG&A / Revenue</td><td>${(initialMetrics.sgaToRevenue * 100).toFixed(2)}%</td></tr>
          <tr><td>CAPEX / Revenue</td><td>${(initialMetrics.capexToRevenue * 100).toFixed(2)}%</td></tr>
        </table>
      </div>

      <div class="section">
        <h2>Formula Verification</h2>
        <table>
          <tr><td>ROIC Calculation</td><td>EBIT × (1 - Tax) / Invested Capital</td></tr>
          <tr><td></td><td>${initialMetrics.ebit.toLocaleString()} × 0.78 / ${initialMetrics.investedCapital.toLocaleString()} = ${(initialMetrics.roic * 100).toFixed(2)}%</td></tr>
          <tr><td>Equity Value Calculation</td><td>NPV - Debt - Minority</td></tr>
          <tr><td></td><td>${initialMetrics.npv.toLocaleString()} - ${NET_DEBT.toLocaleString()} - ${MINORITY_INTEREST.toLocaleString()} = ${initialMetrics.equityValue.toLocaleString()}</td></tr>
        </table>
      </div>
    </body>
    </html>
  `;
  
  res.send(html);
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

app.get('/admin/scoreboard', (req: Request, res: Response) => {
  const pin = req.query.pin as string;
  if (pin !== DEFAULT_GAME_CONFIG.adminPin) {
    return res.status(401).json({ success: false, error: 'Invalid admin PIN' });
  }
  
  const state = gameManager.getState();
  const roundHistories = gameManager.getRoundHistories();
  
  // Build scoreboard data with team info and historical stock prices
  const teams = Object.values(state.teams)
    .filter(t => t.isClaimed)
    .map(team => {
      const history = roundHistories[team.teamId] || [];
      
      // Build round-by-round stock prices (for chart)
      const stockPricesByRound: Record<number, number> = {};
      for (const snapshot of history) {
        stockPricesByRound[snapshot.round] = snapshot.stockPrice;
      }
      // Add current stock price if not in history yet
      if (!stockPricesByRound[state.currentRound] && state.status !== 'lobby') {
        stockPricesByRound[state.currentRound] = team.stockPrice;
      }
      
      return {
        teamId: team.teamId,
        teamName: team.teamName,
        currentStockPrice: team.stockPrice,
        cumulativeTSR: team.cumulativeTSR,
        stockPricesByRound,
      };
    })
    // Sort by cumulative TSR (highest first)
    .sort((a, b) => b.cumulativeTSR - a.cumulativeTSR);
  
  res.json({
    success: true,
    currentRound: state.currentRound,
    status: state.status,
    scenario: state.scenario,
    teams,
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
  
  socket.on('join-game', (teamName: string, reconnectToken: string | undefined, callback: (success: boolean, error?: string, teamId?: number, reconnectToken?: string) => void) => {
    // Handle old clients that don't send reconnectToken (callback is in second position)
    if (typeof reconnectToken === 'function') {
      const oldCallback = reconnectToken as (success: boolean, error?: string, teamId?: number, reconnectToken?: string) => void;
      console.log(`[Socket] Team "${teamName}" attempting to join from ${socket.id} (no token)`);
      const result = gameManager.joinGame(teamName, socket.id, undefined);
      
      if (result.success && result.teamId) {
        socket.join(`team-${result.teamId}`);
        io.emit('team-joined', result.teamId);
        console.log(`[Socket] Team "${teamName}" (ID: ${result.teamId}) joined successfully`);
      }
      oldCallback(result.success, result.error, result.teamId, result.reconnectToken);
      return;
    }
    
    console.log(`[Socket] Team "${teamName}" attempting to join from ${socket.id}${reconnectToken ? ' (with token)' : ''}`);
    const result = gameManager.joinGame(teamName, socket.id, reconnectToken);
    
    if (result.success && result.teamId) {
      socket.join(`team-${result.teamId}`);
      io.emit('team-joined', result.teamId);
      console.log(`[Socket] Team "${teamName}" (ID: ${result.teamId}) joined successfully`);
    }
    callback(result.success, result.error, result.teamId, result.reconnectToken);
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

  socket.on('unsubmit-decisions', (callback: (success: boolean, error?: string) => void) => {
    console.log(`[Socket] Unsubmit requested from ${socket.id}`);
    const result = gameManager.unsubmitDecisions(socket.id);
    
    if (result.success && result.teamId) {
      io.emit('team-unsubmitted', result.teamId);
      console.log(`[Socket] Team ${result.teamId} unsubmitted their decisions`);
    }
    callback(result.success, result.error);
  });

  socket.on('toggle-decision', (decisionId: string, selected: boolean) => {
    gameManager.toggleDecision(socket.id, decisionId, selected);
  });
  
  socket.on('sync-draft-selections', (decisionIds: string[]) => {
    gameManager.syncDraftSelections(socket.id, decisionIds);
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

// Bind to 0.0.0.0 for cloud deployment (Render, Railway, etc.)
const HOST = process.env.HOST || '0.0.0.0';

httpServer.listen(Number(PORT), HOST, () => {
  console.log(`\n🎮 Magna TSR Challenge Server`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🌐 HTTP:      http://${HOST}:${PORT}`);
  console.log(`🔌 WebSocket: ws://${HOST}:${PORT}`);
  console.log(`📊 Health:    http://${HOST}:${PORT}/api/health`);
  console.log(`⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Port bound successfully - ready for connections`);
  
  const configValidation = validateDecisionConfiguration();
  if (configValidation.valid) {
    console.log(`✅ Decision configuration: Valid (75 cards)`);
  } else {
    console.log(`⚠️  Decision configuration errors:`);
    configValidation.errors.forEach(e => console.log(`   - ${e}`));
  }
  
  // Display t=0 baseline financial state
  const initialMetrics = createInitialMetrics();
  console.log(`\n📊 T=0 BASELINE FINANCIAL STATE`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Income Statement:`);
  console.log(`  Revenue:     $${initialMetrics.revenue.toLocaleString()}M`);
  console.log(`  COGS:        $${initialMetrics.cogs.toLocaleString()}M`);
  console.log(`  SG&A:        $${initialMetrics.sga.toLocaleString()}M`);
  console.log(`  EBITDA:      $${initialMetrics.ebitda.toLocaleString()}M`);
  console.log(`  EBIT:        $${initialMetrics.ebit.toLocaleString()}M`);
  console.log(`\nValuation:`);
  console.log(`  NPV:         $${initialMetrics.npv.toLocaleString()}M`);
  console.log(`  Debt:        $${NET_DEBT.toLocaleString()}M`);
  console.log(`  Minority:    $${MINORITY_INTEREST.toLocaleString()}M`);
  console.log(`  Equity:      $${initialMetrics.equityValue.toLocaleString()}M`);
  console.log(`  Share Price: $${initialMetrics.sharePrice.toFixed(2)}`);
  console.log(`  Shares:      ${initialMetrics.sharesOutstanding.toLocaleString()}M`);
  console.log(`\nPerformance Metrics:`);
  console.log(`  WACC:        ${(WACC * 100).toFixed(1)}%`);
  console.log(`  ROIC:        ${(initialMetrics.roic * 100).toFixed(2)}%`);
  console.log(`  EBITDA Mgn:  ${(initialMetrics.ebitdaMargin * 100).toFixed(2)}%`);
  console.log(`  EBIT Mgn:    ${(initialMetrics.ebitMargin * 100).toFixed(2)}%`);
  console.log(`  Invested Cap: $${initialMetrics.investedCapital.toLocaleString()}M`);
  
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
