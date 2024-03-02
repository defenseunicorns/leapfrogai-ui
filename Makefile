VERSION ?= $(shell git describe --abbrev=0 --tags | sed -e 's/^v//')
ifeq ($(VERSION),)
  VERSION := latest
endif

.PHONY: all

docker-build:
	docker build -t ghcr.io/defenseunicorns/leapfrogai/leapfrogai-ui:${VERSION} .

docker-run:
	docker run -it ghcr.io/defenseunicorns/leapfrogai/leapfrogai-ui:${VERSION}

docker-run-gpu:
	echo "NotImplementedError, GPU Device: ${DEVICE}"

docker-push:
	docker push ghcr.io/defenseunicorns/leapfrogai/leapfrogai-ui:${VERSION}

zarf-create:
	zarf package create . --confirm

zarf-deploy:
	zarf package deploy --confirm zarf-package-*.tar.zst

zarf-publish:
	zarf package publish zarf-*.tar.zst oci://ghcr.io/defenseunicorns/packages/
