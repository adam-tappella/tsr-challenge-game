#!/bin/bash

#######################################################################
# CST-Rewired Starter - macOS Setup Script
# 
# This script automates the project setup process.
# Run from the CST-Rewired-Starter folder:
#   chmod +x scripts/setup-mac.sh && ./scripts/setup-mac.sh
#######################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Get the directory where this script lives (the starter kit)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
STARTER_KIT_DIR="$(dirname "$SCRIPT_DIR")"

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}  ${BOLD}🚀 CST-Rewired Starter - Setup Script${NC}                        ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}     Automate your project setup in seconds                    ${CYAN}║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

#######################################################################
# STEP 1: Check Prerequisites
#######################################################################
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}📋 Step 1: Checking Prerequisites${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

MISSING_DEPS=()

# Check Git
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version | cut -d' ' -f3)
    echo -e "  ${GREEN}✓${NC} Git installed (v$GIT_VERSION)"
else
    echo -e "  ${RED}✗${NC} Git not found"
    MISSING_DEPS+=("git")
fi

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "  ${GREEN}✓${NC} Node.js installed ($NODE_VERSION)"
else
    echo -e "  ${RED}✗${NC} Node.js not found"
    MISSING_DEPS+=("node")
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "  ${GREEN}✓${NC} npm installed (v$NPM_VERSION)"
else
    echo -e "  ${RED}✗${NC} npm not found"
    MISSING_DEPS+=("npm")
fi

# Check Cursor (optional)
if command -v cursor &> /dev/null; then
    echo -e "  ${GREEN}✓${NC} Cursor CLI available"
    CURSOR_AVAILABLE=true
else
    echo -e "  ${YELLOW}!${NC} Cursor CLI not found (optional - can open manually)"
    CURSOR_AVAILABLE=false
fi

echo ""

# If missing dependencies, offer to install via Homebrew
if [ ${#MISSING_DEPS[@]} -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Missing dependencies: ${MISSING_DEPS[*]}${NC}"
    echo ""
    
    if command -v brew &> /dev/null; then
        echo -e "Homebrew detected. Would you like to install missing dependencies?"
        read -p "Install via Homebrew? (y/n): " INSTALL_DEPS
        
        if [[ "$INSTALL_DEPS" =~ ^[Yy]$ ]]; then
            echo ""
            echo -e "${BLUE}Installing dependencies...${NC}"
            brew install "${MISSING_DEPS[@]}"
            echo -e "${GREEN}✓ Dependencies installed!${NC}"
        else
            echo -e "${RED}Cannot continue without required dependencies.${NC}"
            echo "Please install manually:"
            echo "  brew install git node"
            exit 1
        fi
    else
        echo -e "${YELLOW}Homebrew not found.${NC}"
        echo "Install Homebrew first:"
        echo '  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
        echo ""
        echo "Then install dependencies:"
        echo "  brew install git node"
        exit 1
    fi
fi

#######################################################################
# STEP 2: Get Project Details
#######################################################################
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}📝 Step 2: Project Configuration${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Project name
read -p "Project name (lowercase, no spaces, e.g., my-cool-app): " PROJECT_NAME
PROJECT_NAME=${PROJECT_NAME:-my-project}
# Sanitize: lowercase, replace spaces with dashes
PROJECT_NAME=$(echo "$PROJECT_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')

# Project location
DEFAULT_LOCATION="$HOME/Documents"
read -p "Where to create the project? [$DEFAULT_LOCATION]: " PROJECT_LOCATION
PROJECT_LOCATION=${PROJECT_LOCATION:-$DEFAULT_LOCATION}

# Expand ~ if used
PROJECT_LOCATION="${PROJECT_LOCATION/#\~/$HOME}"

# Full project path
PROJECT_PATH="$PROJECT_LOCATION/$PROJECT_NAME"

echo ""
echo -e "  Project: ${CYAN}$PROJECT_NAME${NC}"
echo -e "  Path:    ${CYAN}$PROJECT_PATH${NC}"
echo ""

# Confirm
read -p "Create project at this location? (y/n): " CONFIRM
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    echo "Setup cancelled."
    exit 0
fi

# Ask about Cursor Tutorial App
echo ""
echo -e "${BOLD}🎓 Cursor Tutorial App${NC}"
echo -e "Would you like to generate an interactive Cursor IDE tutorial app?"
echo -e "This creates a realistic Cursor replica that teaches new users the interface."
echo ""
read -p "Include Cursor Tutorial App? (y/n): " INCLUDE_TUTORIAL
INCLUDE_TUTORIAL=${INCLUDE_TUTORIAL:-n}

#######################################################################
# STEP 3: Create Project
#######################################################################
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}📁 Step 3: Creating Project Structure${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if directory exists
if [ -d "$PROJECT_PATH" ]; then
    echo -e "${YELLOW}⚠️  Directory already exists: $PROJECT_PATH${NC}"
    read -p "Delete and recreate? (y/n): " DELETE_EXISTING
    if [[ "$DELETE_EXISTING" =~ ^[Yy]$ ]]; then
        rm -rf "$PROJECT_PATH"
    else
        echo "Setup cancelled."
        exit 1
    fi
fi

# Create project directory
mkdir -p "$PROJECT_PATH"
echo -e "  ${GREEN}✓${NC} Created project directory"

# Copy starter kit contents
echo -e "  ${BLUE}...${NC} Copying starter kit files"

# Copy .cursor folder
cp -r "$STARTER_KIT_DIR/.cursor" "$PROJECT_PATH/" 2>/dev/null || true
echo -e "  ${GREEN}✓${NC} Copied .cursor/rules/"

# Copy code-templates
cp -r "$STARTER_KIT_DIR/code-templates" "$PROJECT_PATH/"
echo -e "  ${GREEN}✓${NC} Copied code-templates/"

# Copy config-templates
cp -r "$STARTER_KIT_DIR/config-templates" "$PROJECT_PATH/"
echo -e "  ${GREEN}✓${NC} Copied config-templates/"

# Copy ui folder
cp -r "$STARTER_KIT_DIR/ui" "$PROJECT_PATH/"
echo -e "  ${GREEN}✓${NC} Copied ui/"

# Copy docs-templates as docs
cp -r "$STARTER_KIT_DIR/docs-templates" "$PROJECT_PATH/docs"
echo -e "  ${GREEN}✓${NC} Copied docs-templates/ → docs/"

# Copy .cursorrules
cp "$STARTER_KIT_DIR/.cursorrules" "$PROJECT_PATH/" 2>/dev/null || true
echo -e "  ${GREEN}✓${NC} Copied .cursorrules"

# Copy deployment folder (optional)
cp -r "$STARTER_KIT_DIR/deployment" "$PROJECT_PATH/" 2>/dev/null || true
echo -e "  ${GREEN}✓${NC} Copied deployment/"

# Copy Cursor Tutorial App if requested
if [[ "$INCLUDE_TUTORIAL" =~ ^[Yy]$ ]]; then
    if [ -d "$STARTER_KIT_DIR/cursor-tutorial-app" ]; then
        cp -r "$STARTER_KIT_DIR/cursor-tutorial-app" "$PROJECT_PATH/"
        echo -e "  ${GREEN}✓${NC} Copied cursor-tutorial-app/"
    fi
fi

#######################################################################
# STEP 4: Initialize Git
#######################################################################
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}🔧 Step 4: Initializing Git Repository${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cd "$PROJECT_PATH"
git init -q
echo -e "  ${GREEN}✓${NC} Initialized git repository"

# Create .gitignore
cat > .gitignore << 'EOF'
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
EOF
echo -e "  ${GREEN}✓${NC} Created .gitignore"

#######################################################################
# STEP 5: Create Frontend Structure
#######################################################################
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}⚛️  Step 5: Creating Frontend Structure${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Create src directories
mkdir -p src/components/ui
mkdir -p src/hooks
mkdir -p src/stores
mkdir -p src/lib
mkdir -p src/types
mkdir -p src/utils
mkdir -p public
echo -e "  ${GREEN}✓${NC} Created src/ folder structure"

# Copy and rename config files
cp "$PROJECT_PATH/config-templates/frontend/package.json.template" "$PROJECT_PATH/package.json"
cp "$PROJECT_PATH/config-templates/frontend/tsconfig.json.template" "$PROJECT_PATH/tsconfig.json"
cp "$PROJECT_PATH/config-templates/frontend/tsconfig.node.json.template" "$PROJECT_PATH/tsconfig.node.json"
cp "$PROJECT_PATH/config-templates/frontend/vite.config.ts.template" "$PROJECT_PATH/vite.config.ts"
cp "$PROJECT_PATH/config-templates/frontend/tailwind.config.js.template" "$PROJECT_PATH/tailwind.config.js"
cp "$PROJECT_PATH/config-templates/frontend/postcss.config.js.template" "$PROJECT_PATH/postcss.config.js"
echo -e "  ${GREEN}✓${NC} Created config files from templates"

# Update package.json with project name
if command -v sed &> /dev/null; then
    sed -i '' "s/\"name\": \".*\"/\"name\": \"$PROJECT_NAME\"/" "$PROJECT_PATH/package.json" 2>/dev/null || true
    echo -e "  ${GREEN}✓${NC} Updated package.json with project name"
fi

# Create index.html
cat > index.html << EOF
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>$PROJECT_NAME</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF
echo -e "  ${GREEN}✓${NC} Created index.html"

# Create main.tsx
cat > src/main.tsx << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOF
echo -e "  ${GREEN}✓${NC} Created src/main.tsx"

# Create App.tsx
cat > src/App.tsx << EOF
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
            🚀 $PROJECT_NAME
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
EOF
echo -e "  ${GREEN}✓${NC} Created src/App.tsx"

# Create index.css with Tailwind and design tokens
cat > src/index.css << 'EOF'
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
EOF
echo -e "  ${GREEN}✓${NC} Created src/index.css with design tokens"

# Create utils.ts
cat > src/lib/utils.ts << 'EOF'
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function for merging Tailwind CSS classes
 * Combines clsx for conditional classes with tailwind-merge for deduplication
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
EOF
echo -e "  ${GREEN}✓${NC} Created src/lib/utils.ts"

# Create vite.svg
cat > public/vite.svg << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--logos" width="31.88" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 257"><defs><linearGradient id="IconifyId1813088fe1fbc01fb466" x1="-.828%" x2="57.636%" y1="7.652%" y2="78.411%"><stop offset="0%" stop-color="#41D1FF"></stop><stop offset="100%" stop-color="#BD34FE"></stop></linearGradient><linearGradient id="IconifyId1813088fe1fbc01fb467" x1="43.376%" x2="50.316%" y1="2.242%" y2="89.03%"><stop offset="0%" stop-color="#FFBD4F"></stop><stop offset="100%" stop-color="#FF980E"></stop></linearGradient></defs><path fill="url(#IconifyId1813088fe1fbc01fb466)" d="M255.153 37.938L134.897 252.976c-2.483 4.44-8.862 4.466-11.382.048L.875 37.958c-2.746-4.814 1.371-10.646 6.827-9.67l120.385 21.517a6.537 6.537 0 0 0 2.322-.004l117.867-21.483c5.438-.991 9.574 4.796 6.877 9.62Z"></path><path fill="url(#IconifyId1813088fe1fbc01fb467)" d="M185.432.063L96.44 17.501a3.268 3.268 0 0 0-2.634 3.014l-5.474 92.456a3.268 3.268 0 0 0 3.997 3.378l24.777-5.718c2.318-.535 4.413 1.507 3.936 3.838l-7.361 36.047c-.495 2.426 1.782 4.5 4.151 3.78l15.304-4.649c2.372-.72 4.652 1.36 4.15 3.788l-11.698 56.621c-.732 3.542 3.979 5.473 5.943 2.437l1.313-2.028l72.516-144.72c1.215-2.423-.88-5.186-3.54-4.672l-25.505 4.922c-2.396.462-4.435-1.77-3.759-4.114l16.646-57.705c.677-2.35-1.37-4.583-3.769-4.113Z"></path></svg>
EOF
echo -e "  ${GREEN}✓${NC} Created public/vite.svg"

#######################################################################
# STEP 6: Install Dependencies
#######################################################################
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}📦 Step 6: Installing Dependencies${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "  ${BLUE}...${NC} Running npm install (this may take a minute)"
npm install --silent
echo -e "  ${GREEN}✓${NC} Dependencies installed"

#######################################################################
# COMPLETE
#######################################################################
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}🎉 Setup Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  Your project is ready at: ${CYAN}$PROJECT_PATH${NC}"
echo ""
echo -e "  ${BOLD}Next step:${NC}"
echo ""
echo -e "  ${CYAN}\"Tell cursor to launch the webapp in a separate browser locally\"${NC}"
echo ""

# If tutorial app was included, show instructions
if [[ "$INCLUDE_TUTORIAL" =~ ^[Yy]$ ]]; then
    echo -e "  ${BOLD}🎓 Cursor Tutorial App:${NC}"
    echo -e "     ${CYAN}cd cursor-tutorial-app && npm install && npm run dev${NC}"
    echo -e "     Then open: ${CYAN}http://localhost:5173${NC}"
    echo ""
fi

# Offer to open in Cursor
if [ "$CURSOR_AVAILABLE" = true ]; then
    read -p "Open project in Cursor now? (y/n): " OPEN_CURSOR
    if [[ "$OPEN_CURSOR" =~ ^[Yy]$ ]]; then
        cursor "$PROJECT_PATH"
        echo -e "  ${GREEN}✓${NC} Opened in Cursor!"
    fi
fi

echo ""
echo -e "${CYAN}Happy coding! 🚀${NC}"
echo ""
