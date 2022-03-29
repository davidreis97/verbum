This is the service that provides matchmaking and game logic features through HTTP and WebSockets with Centrifuge.

### Development

- `make` or `make run` - Builds and starts the service.
- `make build` - Builds the service and outputs the executable to `bin/`

### Configuration and Production Mode

There are two config files, `config.json` and `devconfig.json`.
   - `config.json` has production settings and is used when the env var `ENV` is set to `PRODUCTION`. 
   - `devconfig.json` has development-friendly settings and is used when the env var `ENV` is not set to `PRODUCTION`.

The GIN webserver also starts in production mode when the env var `ENV` is set to `PRODUCTION`.
