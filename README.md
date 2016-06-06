# dot-net-core-dnx-rc2-converter
Node JS CLI tool to update .net core projects from rc1 to rc2

### To Use
1. Install Node.js
2. `npm install jspm -g`
3. Git clone the project into the directory where your .net projects reside.
4. CD into this folder and run `jspm install`
5. Run `jspm run main`. This will recursively search the directory this tool was added to for project.json files and update them.
