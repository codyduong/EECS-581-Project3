# itemors

| Place Id                                                        | Place Name - Description                              |
| --------------------------------------------------------------- | ----------------------------------------------------- |
| [129960798081914](https://www.roblox.com/games/129960798081914) | Itemated - primary lobby and place to join experience |
| [127544595844329](https://www.roblox.com/games/127544595844329) | Game - place users are sent to after starting a game  |
| [113026681654376](https://www.roblox.com/games/113026681654376) | test_lobby0                                           |
| [109985485201818](https://www.roblox.com/games/109985485201818) | test_lobby1                                           |
| [97095846823877](https://www.roblox.com/games/97095846823877)   | test_lobby2                                           |
| [125665205874769](https://www.roblox.com/games/125665205874769) | test_game0                                            |
| [125743289479388](https://www.roblox.com/games/125743289479388) | test_game1                                            |
| [117826945510743](https://www.roblox.com/games/117826945510743) | test_game2                                            |

## Development

### docker-compose

A docker-compose has been provided for ease of development that is platform agnostic.

```sh
docker build -t itemated -f Dockerfile.base .
docker-compose up --watch
```

> [!IMPORTANT]
> The addresses in the docker-compose logs are actually the internal container addresses.
>
> ```
> lobby-1   | [ROJO] Visit http://0.0.0.0:34872/ in your browser for more information.
> game-1   | [ROJO] Visit http://0.0.0.0:34873/ in your browser for more information.
> ```
>
> These are actually forwarded to localhost, so to access them on your own machine:
>
> - http://localhost:34872/
> - http://localhost:34873/

### Manual

#### Dependencies

* [aftman](https://github.com/LPGhatguy/aftman) as our toolchain manager
* [Node.js](https://nodejs.org/en/download/package-manager)
  * [yarn](https://yarnpkg.com/) is the preferred package manager
  * You can also use a node version manager like [nvm](https://github.com/nvm-sh/nvm)

```sh
# aftman requires explicit trusting via the add command
aftman add rojo-rbx/rojo
aftman add UpliftGames/wally@0.3.2
# ^^^ these only have to be run the first time you use aftman
aftman install
wally install
yarn install
# you'll need multiple terminals to host all the processes
npx rbxtsc -w --rojo lobby.project.json -p tsconfig.lobby.json --logTruthyChanges --verbose
rojo serve lobby.project.json --address 0.0.0.0 -v
```
