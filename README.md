# Memory-Game

Super difficult 10X10 memory game.

- Uses emojis

## Run

`npm install && npm run dev`

Or, if you want to containerize it, simply

1. `docker build memory-game:latest .`
2. `docker run --rm -d -p 80:80/tcp memory-game:latest`
