# Tietokone IDE

A collaborative code editor for the web.

## Local dev env

### Dependencies

- .NET SDK
- Node.js (for bundling)
- docker-compose (for running deps)

### Running

```bash
docker-compose up -d
dotenv dotnet watch run

# optionally rebuild frontend bundle on file change
fswatch -or ./wwwroot/css ./wwwroot/js | xargs -n1 -I{} npm run heroku-postbuild
```
