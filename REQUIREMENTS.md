# Development Requirements

This document lists the required tools and software versions needed to use this starter kit.

## Required Tools

### Version Control
- **Git** (2.30+)
  - Verify: `git --version`
  - macOS: `brew install git` or Xcode Command Line Tools
  - Windows: Download from [git-scm.com](https://git-scm.com/)

### Runtime & Package Management
- **Node.js** (20.x LTS recommended, 18.x+ minimum)
  - Verify: `node --version`
  - Download: [nodejs.org](https://nodejs.org/)
  - npm is included with Node.js

### Development Environment
- **Cursor IDE** (latest)
  - Required for AI-assisted development
  - Download: [cursor.sh](https://cursor.sh/)

### Containerization (Optional but Recommended)
- **Docker Desktop** (latest)
  - Required for local PostgreSQL
  - Verify: `docker --version`
  - Download: [docker.com](https://www.docker.com/products/docker-desktop/)

## Optional Tools

### Python (for data pipelines)
- **Python** (3.9+)
  - Verify: `python --version` or `python3 --version`
  - macOS: `brew install python@3.11`

### GitHub CLI
- **gh** CLI
  - Useful for managing repos and PRs
  - Install: `brew install gh` (macOS)

## Verification Script

Run these commands to verify your setup:

```bash
# Check Git
git --version

# Check Node.js
node --version
npm --version

# Check Docker (optional)
docker --version

# Check Python (optional)
python3 --version
```

## Platform-Specific Notes

### macOS
- Xcode Command Line Tools include Git
- Install via Homebrew: `brew install git node`
- Docker Desktop available for Apple Silicon

### Windows
- Git for Windows includes Git Bash
- Docker Desktop requires WSL2 on Windows 10/11
- Consider using Windows Subsystem for Linux (WSL)

#### Node.js Installation (Windows)

**Option 1: winget (Recommended)**
```powershell
winget install OpenJS.NodeJS.LTS --scope user
```

**Option 2: nvm-windows**
1. Download [nvm-windows](https://github.com/coreybutler/nvm-windows/releases)
2. Install and run:
```cmd
nvm install 20.11.1
nvm use 20.11.1
```

**Configure npm for User Space:**
```cmd
npm config set prefix %USERPROFILE%\AppData\Roaming\npm --location=user
npm config set cache %USERPROFILE%\AppData\Local\npm-cache --location=user
```

### Linux
- Most distributions include Git and Python
- Node.js via NodeSource repository or nvm

## Version Compatibility

| Tool | Minimum | Recommended |
|------|---------|-------------|
| Git | 2.30.0 | Latest |
| Node.js | 18.0.0 | 20.x LTS |
| Docker | 20.10.0 | Latest |
| Python | 3.9.0 | 3.11+ |
| Cursor IDE | - | Latest |

## Troubleshooting

### Git Not Found
- Ensure Git is in your PATH
- Restart terminal after installation
- macOS: `xcode-select --install`

### Node.js Version Issues
- Use `nvm` (Node Version Manager) to manage versions
- macOS/Linux: `nvm install 20 && nvm use 20`
- Windows: Use nvm-windows

### Docker Not Running
- Ensure Docker Desktop is started
- Linux: `sudo systemctl start docker`
- Verify: `docker ps`

## Next Steps

Once all tools are installed:

1. Copy this starter kit to your project folder
2. Open in Cursor IDE
3. Follow the [SETUP_WIZARD.html](./SETUP_WIZARD.html) for step-by-step setup instructions
