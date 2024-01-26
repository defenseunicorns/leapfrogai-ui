VERSION ?= $(shell git describe --abbrev=0 --tags)

docker-build:
	docker build -t ghcr.io/defenseunicorns/leapfrogai/leapfrog-ui:${VERSION} .

zarf-build:
	zarf package create . --confirm --set IMAGE_VERSION=${VERSION}