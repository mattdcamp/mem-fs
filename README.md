# mem-fs
A simplistic in memory filesystem.

## Running the application

### Docker
In order to simplify installation, a Docker image is provided which runs the initial and advanced requirements on a
Ubuntu contianer. This will ensure the correct version of Node and all dependencies. If you already have Docker installed, this will be the simplest option to see the code execute.
1. (If you don't already have it) Install Docker for your operating system [Docker Documentation](https://www.docker.com/get-started/)
1. (If you haven't logged in before) Log in to DockerHub via the installed application.
1. Run the image from dockerhub: `docker run -it mattdcamp/mem-fs:release`

### Local Install
You can also run a local version of the application.
1. Install Node (https://nodejs.org/en/download) or NVM
   ([Windows](https://learn.microsoft.com/en-us/windows/dev-environment/javascript/nodejs-on-windows),
  or [Brew](https://formulae.brew.sh/formula/nvm)). ** I would reccomend the NVM option as Node comes in many versions
  and this project supplies an .nvmrc file which ensure the correct version is installed. If you are going to install
  node directly, this project uses 21.2.0. 
1. Install yarn. Ensuring that you are using the correct version of Node. `npm install -g yarn`
1. Install project dependencies `yarn install`
1. Build the source `yarn build`
1. Build the project `yarn start`

### Development
1. Follow the steps above to install Node, Yarn and the project's dependencies.
1. The Typescript can be executed without building the project `yarn dev`.
1. Unit Tests can be executed with `yarn test`
1. Other development scripts include `yarn lint` to lint the project and `yarn format` to ensure the correct format is
   used. To fix issues using the libraries functionality `yarn lint --fix` or `yarn format-write` respectivly.


### Sample output
To prevent you from having to run anything, below is the example output from the script:
```
yarn start
Basic Requirements (given example):
get working directory => "/school/"
get working directory content => "history, math, spanish"
get working directory => "/school/homework/"
get working directory content => "cheatsheets, homework"
get working directory => "/"
File IO Requirements:
get working directory content => "algebra.txt"
read file => x = 4
Move File Requirements:
get working directory content => "algebra2.txt"
read file => x = 4
Find Files Requirements:
find files => "/school/homework/math/algebra2.txt"
Advanced Requirements: Move/Copy
get working directory content => "algebra2.txt, algebra2.txt (1)"
Advanced Requirements: Operations on Paths
get working directory content => "history, math, spanish, schedule.txt"
Advanced Requirements: Links
get working directory content => "mathHardLink, mathSoftLink, school"
getContent through hard link => "algebra2.txt, algebra2.txt (1), algebra3.txt, algebra4.txt"
getContent through soft link => "algebra2.txt, algebra2.txt (1), algebra3.txt, algebra4.txt"
getContent through path => "algebra2.txt, algebra2.txt (1), algebra3.txt, algebra4.txt"
read file through path => "x = 4"
read file through hard link => "x = 4"
read file through soft link => "x = 4"
read file through path => "x = 6"
read file through hard link => "x = 6"
read file through soft link => "x = 6"
read file through path => "x = 7"
read file through hard link => "x = 7"
read file through soft link => "x = 7"
Advanced Requirements: Streams
read file => "x = 0
x = 1
x = 2
x = 3
x = 4
x = 5
x = 6
x = 7
x = 8
x = 9
"
read file => "x = 0
x = 1
x = 2
x = 3
x = 4
x = 5
x = 6
x = 7
x = 8
x = 9
"
continue typing new lines to add content to the file. An empty line will end the stream:
Hello
World
This is piped from stdin

read file => "Hello
World
This is piped from stdin

"
```

## Code Description
The code is organized into a folder structure as follows
- `src`: Contains the source code for the application
  - `main.ts`: Contains the example code
  - `filesystem`: The FileSystem implementation
    - `index.ts`: Easy to import definitions for the FileSystem Facade
    - `filesystem.ts`: The definition of the FileSystem Facade, designed to be used without exposing any interal data
      structures
    - `controllers`: Uses `FileSystemDescriptor`s and it's extended interfaces to implement logical functions for the
      FileSystem
      - `index.ts`: Easy to import functions for the Controller functions
      - `folderBuilders.ts`: Functions for building folder nodes
      - `linkBuilders.ts`: Functions for building hard and soft nodes
      - `pathCopiers.ts`: Functions for copying and moving (copying + deleting) files and folders
      - `pathResolvers.ts`: Functions for working with absolute and relative paths
    - `FileDescriptor`: The internal data structures of the filesystem
      - `index.ts`: Easy to import functions and interfaces for all the data structures
      - `linkDescriptor`: Data structures for hard and soft links for files and folders
        - `index.ts`: Easy to import functions and interfaces for all the link data structures
        - `linkFileDescriptors`: The hard and soft link implementation for Files
        - `linkFolderDescriptors`: The hard and soft link implementation for Folders
      - `fileDescriptor.ts`: The file data structure
      - `folderDescriptor.ts`: The folder data structure
- `.github`: Github specific source. Contains the Github Actions used in this project to CI PRs/Branches and Push
  Releases to Docker
- `.vscode`: project files for using [VSCode](https://code.visualstudio.com/download). The recomeneded IDE for this
  project.
- `.yarn`: dependency information
- `.eslintrc.yml`: [eslint](https://eslint.org/) configuration
- `.nvmrc`: Node Version Manager file for automatically using the correct version of Node with this project
- `.prettierrc.yml`: [Prettier](https://prettier.io) configuration for formatting
- `.yarnrc.yml`: [yarn](https://yarnpkg.com/) configuration
- `Dockerfile`: Docker build file
- `jest.config.ts`: [Jest](https://jestjs.io/) configuration for unit testing
- `package.json`: NPM / Yarn package information.
- `tsconfig.build.json`: Typescript compiler configuration used with `yarn build` (excludeds test files). Used in the
  published docker image.
- `tsconfig.json`: Typescript compiler configuration used in all other `yarn` targets, vscode and jest for development.
  This includes the test files.
- `yarn.lock`: Generated file that ensures builds use identical versions of dependencies in the build process.