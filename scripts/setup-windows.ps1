#######################################################################
# CST-Rewired Starter - Windows Setup Script (PowerShell)
# 
# This script automates the project setup process.
# Run from PowerShell:
#   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
#   .\scripts\setup-windows.ps1
#######################################################################

$ErrorActionPreference = "Stop"

# Get script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$StarterKitDir = Split-Path -Parent $ScriptDir

# Colors
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🚀 CST-Rewired Starter - Setup Script                       ║" -ForegroundColor Cyan
Write-Host "║     Automate your project setup in seconds                   ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

#######################################################################
# STEP 1: Check Prerequisites
#######################################################################
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host "📋 Step 1: Checking Prerequisites" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host ""

$MissingDeps = @()

# Check Git
try {
    $GitVersion = git --version 2>$null
    Write-Host "  ✓ Git installed ($GitVersion)" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Git not found" -ForegroundColor Red
    $MissingDeps += "Git.Git"
}

# Check Node.js
try {
    $NodeVersion = node --version 2>$null
    Write-Host "  ✓ Node.js installed ($NodeVersion)" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Node.js not found" -ForegroundColor Red
    $MissingDeps += "OpenJS.NodeJS.LTS"
}

# Check npm
try {
    $NpmVersion = npm --version 2>$null
    Write-Host "  ✓ npm installed (v$NpmVersion)" -ForegroundColor Green
} catch {
    Write-Host "  ✗ npm not found" -ForegroundColor Red
}

# Check Cursor
$CursorAvailable = $false
try {
    $null = Get-Command cursor -ErrorAction Stop
    Write-Host "  ✓ Cursor CLI available" -ForegroundColor Green
    $CursorAvailable = $true
} catch {
    Write-Host "  ! Cursor CLI not found (optional - can open manually)" -ForegroundColor Yellow
}

Write-Host ""

# If missing dependencies, offer to install via winget
if ($MissingDeps.Count -gt 0) {
    Write-Host "⚠️  Missing dependencies: $($MissingDeps -join ', ')" -ForegroundColor Yellow
    Write-Host ""
    
    try {
        $null = Get-Command winget -ErrorAction Stop
        $InstallDeps = Read-Host "Install missing dependencies via winget? (y/n)"
        
        if ($InstallDeps -match "^[Yy]") {
            Write-Host ""
            Write-Host "Installing dependencies..." -ForegroundColor Blue
            foreach ($Dep in $MissingDeps) {
                winget install $Dep --accept-package-agreements --accept-source-agreements
            }
            Write-Host "✓ Dependencies installed! Please restart PowerShell and run this script again." -ForegroundColor Green
            exit 0
        } else {
            Write-Host "Cannot continue without required dependencies." -ForegroundColor Red
            Write-Host "Please install manually:"
            Write-Host "  winget install Git.Git OpenJS.NodeJS.LTS"
            exit 1
        }
    } catch {
        Write-Host "winget not found. Please install dependencies manually:" -ForegroundColor Yellow
        Write-Host "  - Git: https://git-scm.com/downloads"
        Write-Host "  - Node.js: https://nodejs.org/"
        exit 1
    }
}

#######################################################################
# STEP 2: Get Project Details
#######################################################################
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host "📝 Step 2: Project Configuration" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host ""

# Project name
$ProjectName = Read-Host "Project name (lowercase, no spaces, e.g., my-cool-app)"
if ([string]::IsNullOrWhiteSpace($ProjectName)) {
    $ProjectName = "my-project"
}
# Sanitize: lowercase, replace spaces with dashes
$ProjectName = $ProjectName.ToLower() -replace '\s+', '-'

# Project location
$DefaultLocation = "$env:USERPROFILE\Documents"
$ProjectLocation = Read-Host "Where to create the project? [$DefaultLocation]"
if ([string]::IsNullOrWhiteSpace($ProjectLocation)) {
    $ProjectLocation = $DefaultLocation
}

# Full project path
$ProjectPath = Join-Path $ProjectLocation $ProjectName

Write-Host ""
Write-Host "  Project: $ProjectName" -ForegroundColor Cyan
Write-Host "  Path:    $ProjectPath" -ForegroundColor Cyan
Write-Host ""

# Confirm
$Confirm = Read-Host "Create project at this location? (y/n)"
if ($Confirm -notmatch "^[Yy]") {
    Write-Host "Setup cancelled."
    exit 0
}

# Ask about Cursor Tutorial App
Write-Host ""
Write-Host "🎓 Cursor Tutorial App" -ForegroundColor White
Write-Host "Would you like to generate an interactive Cursor IDE tutorial app?" -ForegroundColor Gray
Write-Host "This creates a realistic Cursor replica that teaches new users the interface." -ForegroundColor Gray
Write-Host ""
$IncludeTutorial = Read-Host "Include Cursor Tutorial App? (y/n)"

#######################################################################
# STEP 3: Create Project
#######################################################################
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host "📁 Step 3: Creating Project Structure" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host ""

# Check if directory exists
if (Test-Path $ProjectPath) {
    Write-Host "⚠️  Directory already exists: $ProjectPath" -ForegroundColor Yellow
    $DeleteExisting = Read-Host "Delete and recreate? (y/n)"
    if ($DeleteExisting -match "^[Yy]") {
        Remove-Item -Recurse -Force $ProjectPath
    } else {
        Write-Host "Setup cancelled."
        exit 1
    }
}

# Create project directory
New-Item -ItemType Directory -Path $ProjectPath -Force | Out-Null
Write-Host "  ✓ Created project directory" -ForegroundColor Green

# Copy starter kit contents
Write-Host "  ... Copying starter kit files" -ForegroundColor Blue

# Copy .cursor folder
if (Test-Path "$StarterKitDir\.cursor") {
    Copy-Item -Recurse "$StarterKitDir\.cursor" "$ProjectPath\" -Force
    Write-Host "  ✓ Copied .cursor/rules/" -ForegroundColor Green
}

# Copy code-templates
Copy-Item -Recurse "$StarterKitDir\code-templates" "$ProjectPath\" -Force
Write-Host "  ✓ Copied code-templates/" -ForegroundColor Green

# Copy config-templates
Copy-Item -Recurse "$StarterKitDir\config-templates" "$ProjectPath\" -Force
Write-Host "  ✓ Copied config-templates/" -ForegroundColor Green

# Copy ui folder
Copy-Item -Recurse "$StarterKitDir\ui" "$ProjectPath\" -Force
Write-Host "  ✓ Copied ui/" -ForegroundColor Green

# Copy docs-templates as docs
Copy-Item -Recurse "$StarterKitDir\docs-templates" "$ProjectPath\docs" -Force
Write-Host "  ✓ Copied docs-templates/ → docs/" -ForegroundColor Green

# Copy .cursorrules
if (Test-Path "$StarterKitDir\.cursorrules") {
    Copy-Item "$StarterKitDir\.cursorrules" "$ProjectPath\" -Force
    Write-Host "  ✓ Copied .cursorrules" -ForegroundColor Green
}

# Copy deployment folder
if (Test-Path "$StarterKitDir\deployment") {
    Copy-Item -Recurse "$StarterKitDir\deployment" "$ProjectPath\" -Force
    Write-Host "  ✓ Copied deployment/" -ForegroundColor Green
}

# Copy Cursor Tutorial App if requested
if ($IncludeTutorial -match "^[Yy]") {
    if (Test-Path "$StarterKitDir\cursor-tutorial-app") {
        Copy-Item -Recurse "$StarterKitDir\cursor-tutorial-app" "$ProjectPath\" -Force
        Write-Host "  ✓ Copied cursor-tutorial-app/" -ForegroundColor Green
    }
}

#######################################################################
# STEP 4: Initialize Git
#######################################################################
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host "🔧 Step 4: Initializing Git Repository" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host ""

Set-Location $ProjectPath
git init -q
Write-Host "  ✓ Initialized git repository" -ForegroundColor Green

# Create .gitignore
@"
# Dependencies
node_modules/
.pnp
.pnp.js

# Build outputs
dist/
build/
.next/
out/

# Environment
.env
.env.local
.env.*.local

# IDE
.idea/
*.swp
*.swo
.DS_Store

# Logs
logs/
*.log
npm-debug.log*

# Testing
coverage/

# Misc
*.tgz
.cache/
"@ | Out-File -FilePath ".gitignore" -Encoding utf8
Write-Host "  ✓ Created .gitignore" -ForegroundColor Green

#######################################################################
# STEP 5: Create Frontend Structure
#######################################################################
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host "⚛️  Step 5: Creating Frontend Structure" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host ""

# Create src directories
$Directories = @(
    "src\components\ui",
    "src\hooks",
    "src\stores",
    "src\lib",
    "src\types",
    "src\utils",
    "public"
)
foreach ($Dir in $Directories) {
    New-Item -ItemType Directory -Path $Dir -Force | Out-Null
}
Write-Host "  ✓ Created src/ folder structure" -ForegroundColor Green

# Copy and rename config files
Copy-Item "$ProjectPath\config-templates\frontend\package.json.template" "$ProjectPath\package.json" -Force
Copy-Item "$ProjectPath\config-templates\frontend\tsconfig.json.template" "$ProjectPath\tsconfig.json" -Force
Copy-Item "$ProjectPath\config-templates\frontend\tsconfig.node.json.template" "$ProjectPath\tsconfig.node.json" -Force
Copy-Item "$ProjectPath\config-templates\frontend\vite.config.ts.template" "$ProjectPath\vite.config.ts" -Force
Copy-Item "$ProjectPath\config-templates\frontend\tailwind.config.js.template" "$ProjectPath\tailwind.config.js" -Force
Copy-Item "$ProjectPath\config-templates\frontend\postcss.config.js.template" "$ProjectPath\postcss.config.js" -Force
Write-Host "  ✓ Created config files from templates" -ForegroundColor Green

# Update package.json with project name
$PackageJson = Get-Content "$ProjectPath\package.json" -Raw
$PackageJson = $PackageJson -replace '"name": ".*"', "`"name`": `"$ProjectName`""
$PackageJson | Out-File -FilePath "$ProjectPath\package.json" -Encoding utf8
Write-Host "  ✓ Updated package.json with project name" -ForegroundColor Green

# Create index.html
@"
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>$ProjectName</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
"@ | Out-File -FilePath "index.html" -Encoding utf8
Write-Host "  ✓ Created index.html" -ForegroundColor Green

# Create main.tsx
@"
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
"@ | Out-File -FilePath "src\main.tsx" -Encoding utf8
Write-Host "  ✓ Created src/main.tsx" -ForegroundColor Green

# Create App.tsx
@"
/**
 * Main App Component
 * 
 * This is the root component of your application.
 * Start building your UI here!
 */

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">
            🚀 $ProjectName
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Your project is ready! Start building something amazing.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="./ui/STYLE_GUIDE.md"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:opacity-90 transition-opacity"
            >
              View Style Guide
            </a>
            <a
              href="./docs"
              className="px-6 py-3 border border-border rounded-full font-medium hover:bg-accent transition-colors"
            >
              Documentation
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
"@ | Out-File -FilePath "src\App.tsx" -Encoding utf8
Write-Host "  ✓ Created src/App.tsx" -ForegroundColor Green

# Create index.css
@"
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
"@ | Out-File -FilePath "src\index.css" -Encoding utf8
Write-Host "  ✓ Created src/index.css with design tokens" -ForegroundColor Green

# Create utils.ts
@"
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function for merging Tailwind CSS classes
 * Combines clsx for conditional classes with tailwind-merge for deduplication
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
"@ | Out-File -FilePath "src\lib\utils.ts" -Encoding utf8
Write-Host "  ✓ Created src/lib/utils.ts" -ForegroundColor Green

#######################################################################
# STEP 6: Install Dependencies
#######################################################################
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host "📦 Step 6: Installing Dependencies" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host ""

Write-Host "  ... Running npm install (this may take a minute)" -ForegroundColor Blue
npm install --silent 2>$null
Write-Host "  ✓ Dependencies installed" -ForegroundColor Green

#######################################################################
# COMPLETE
#######################################################################
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "🎉 Setup Complete!" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "  Your project is ready at: $ProjectPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Next step:" -ForegroundColor White
Write-Host ""
Write-Host '  "Tell cursor to launch the webapp in a separate browser locally"' -ForegroundColor Cyan
Write-Host ""

# If tutorial app was included, show instructions
if ($IncludeTutorial -match "^[Yy]") {
    Write-Host "  🎓 Cursor Tutorial App:" -ForegroundColor White
    Write-Host "     cd cursor-tutorial-app; npm install; npm run dev" -ForegroundColor Cyan
    Write-Host "     Then open: http://localhost:5173" -ForegroundColor Cyan
    Write-Host ""
}

# Offer to open in Cursor
if ($CursorAvailable) {
    $OpenCursor = Read-Host "Open project in Cursor now? (y/n)"
    if ($OpenCursor -match "^[Yy]") {
        cursor $ProjectPath
        Write-Host "  ✓ Opened in Cursor!" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Cyan
Write-Host ""
