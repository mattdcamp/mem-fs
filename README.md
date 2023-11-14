# mem-fs

## Getting Started
1. Install Node Version with NVM. (Skip if the correct version is already installed)
On Windows:
```Powershell
nvm install $(Get-Content .nvmrc)
```

In Bash:
```bash
cat .nvmrc | nvm install
```

2. Switch to the correct Node version.
On Windows:
```Powershell
nvm use $(Get-Content .nvmrc)
```

In Bash:
```bash
cat .nvmrc | nvm use
```

3. Install Yarn (I used the `-g` flag also to install yarn globally)
```bash
npm install yarn
```

4. Install Dependencies 
```bash
yarn install
```

5. Build
```bash
yarn build
```

6. Run the Application