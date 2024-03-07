VERSION ?= $(shell git describe --abbrev=0 --tags | sed -e 's/^v//')
ifeq ($(VERSION),)
  VERSION := latest
endif

ARCH ?= amd64

.PHONY: all

docker-build:
	docker build -t ghcr.io/defenseunicorns/leapfrogai/leapfrogai-ui:${VERSION} .

docker-run:
	docker run -it ghcr.io/defenseunicorns/leapfrogai/leapfrogai-ui:${VERSION}

docker-push:
	docker push ghcr.io/defenseunicorns/leapfrogai/leapfrogai-ui:${VERSION}

zarf-create:
	zarf package create . --confirm --set=IMAGE_VERSION=$(VERSION) --architecture ${ARCH}

zarf-deploy:
	zarf package deploy --confirm zarf*${ARCH}*.tar.zst

zarf-publish:
	zarf package publish zarf*${ARCH}*.tar.zst oci://ghcr.io/defenseunicorns/packages/leapfrogai/
