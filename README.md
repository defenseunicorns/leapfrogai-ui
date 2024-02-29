# LeapfrogAI UI

[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/defenseunicorns/leapfrogai-ui/badge)](https://securityscorecards.dev/viewer/?uri=github.com/defenseunicorns/leapfrogai-ui)

## Description

A multi-modal Svelte-Kit full-stack application specially built to be compatible with OpenAI and LeapfrogAI Generative AI capabilities.

## Usage

See [instructions](#instructions) to get the UI up and running. Then, go to http://localhost:5173/chat to use the application.

## Instructions

The instructions in this section assume the following:

1. Properly installed and configured Node 21.5.0, to include its development tools
2. The `.env` is created based on the `.env.example`
3. You have [LeapfrogAI API](https://github.com/defenseunicorns/leapfrogai-api) up an running.
3. You have chosen a LeapfrogAI model backend and have that running. Some examples of existing backends:

- https://github.com/defenseunicorns/leapfrogai-backend-llama-cpp-python
- https://github.com/defenseunicorns/leapfrogai-backend-whisper

### Local Development

For cloning a model locally and running the development backend.

```bash
# Install dependencies
npm install

# Start application
npm run dev -- --open
```

### Docker Container

#### Image Build and Run

For local image building and running.

```bash
# Build the docker image
docker build -t ghcr.io/defenseunicorns/leapfrogai/leapfrogai-ui:latest .

# Run the docker container
docker run -p 8080:8080 --env-file .env  ghcr.io/defenseunicorns/leapfrogai/leapfrogai-ui:latest
```
