.PHONY: all

setup:
	npm install

start-tests:
	cd "$(git rev-parse --show-toplevel)" && \
	pm2 start "npm run dev" --name Backend && \
	pm2 start json-server --name ApiServer -- "tests/mock-services/api-server/server.json" --routes="tests/mock-services/api-server/routes.json" --port=8080 --middlewares "tests/mock-services/api-server/middleware.ts"   && \
	pm2 start "npx playwright test --ui" --name Playwright

stop-tests:
	pm2 stop all
	pm2 delete all