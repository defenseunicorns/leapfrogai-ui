[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/defenseunicorns/leapfrogai-ui/badge)](https://securityscorecards.dev/viewer/?uri=github.com/defenseunicorns/leapfrogai-ui)

UI Built with SvelteKit, Tailwind CSS with Daisy UI and [Flowbite Svelte](https://flowbite-svelte.com/docs/) for icons.

## Developing

Once you've created a project and installed dependencies with `npm install` or `pnpm install` or `yarn`:

Copy `.env.example` into `.env` and set all the variables accordingly.
* [Note] If the UI is running within a docker container and tailscale is being used then `OPENAI_API_HOST` value needs to be the [fully qualified domain name](https://tailscale.com/kb/1081/magicdns/#fully-qualified-domain-names-vs-machine-names) of the server.

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

## Docker (dev env)

```bash
docker pull nginx:alpine
docker build -t ask-frogs .
docker run -i -p 5173:5173 ask-frogs (interactive)
docker run -it -d --rm -p 5173:5173 ask-frogs (non-interactive)
```
