APP_NAME = karteikarten_app_api
GH_REPO_NAME = karteikarten_app
VERSION = 1.0.2
HOST ?= 0.0.0.0
PORT ?= 8081
DOCKER_NETWORK ?= net_app
#DATABASE_URL ?= postgres://postgres:postgres@db_postgres:5432/${APP_NAME}?sslmode=disable
DATABASE_URL ?= postgres://postgres:postgres@localhost:5432/${APP_NAME}?sslmode=disable
TEST_DATABASE_URL ?= postgres://postgres:postgres@localhost:5432/${APP_NAME}_test?sslmode=disable
TEST_POSTGRES_URL := $(shell echo ${TEST_DATABASE_URL} | sed "s/${APP_NAME}_test/postgres/")
NATS_URL ?= nats://localhost:4222
CR_USER?=unset
CR_PAT?=unset

.PHONY: help
help:
	@echo "make options\n\
		- all             clean, deps, docs, test, vet, fmt  & build\n\
		- docs            generate domain files from swagger definition\n\
		- deps            fetch all dependencies\n\
		- clean           clean build directory bin/\n\
		- build           build binary bin/${APP_NAME}\n\
		- test            drops _test database, then run test cases\n\
		- run             run localy at HOST:PORT ${HOST}:${PORT}\n\
		- docker-destroy  destroy docker container & image ${APP_NAME}\n\
		- docker-build    build production docker image ${APP_NAME}:${VERSION}\n\
		- docker-stop     stop docker container ${APP_NAME}\n\
		- docker-run      run development docker container ${APP_NAME}:latest, use with reverse proxy\n\
		- release         push latest image to ghcr, login using personal access token env variable CR_USER/CR_PAT\n\
		- help            display this message"

.PHONY: all
all: clean deps test vet fmt build

.PHONY: deps
deps:
	go mod tidy -compat 1.17

.PHONY: docs
docs:
	VERSION=${VERSION} APP_NAME=${APP_NAME} docs/swagger-gen.sh

.PHONY: clean
clean:
	go clean
	rm -rf bin

.PHONY: build
build: docs
	CGO_ENABLED=0 go build -o bin/${APP_NAME} cmd/api/main.go

.PHONY: test
test: build
	psql ${TEST_POSTGRES_URL} -c "DROP DATABASE ${APP_NAME}_test" || true
	DATABASE_URL=${TEST_DATABASE_URL} go test ./...

vet:
	go vet ./...

fmt:
	go list -f '{{.Dir}}' ./... | grep -v /vendor/ | xargs -L1 gofmt -l

.PHONY: run
run: build 
	HOST=${HOST} PORT=${PORT} DATABASE_URL=${DATABASE_URL} bin/${APP_NAME}

# Docker
destroy_container:
	docker container rm ${APP_NAME} -f

destroy_image:
	docker image rm ${APP_NAME}:${VERSION} -f
	docker image rm ${APP_NAME}:latest -f
	docker image rm ghcr.io/${CR_USER}/${APP_NAME}:${VERSION} -f
	docker image rm ghcr.io/${CR_USER}/${APP_NAME}:latest -f

.PHONY: docker-destroy
docker-destroy: destroy_container destroy_image

.PHONY: docker-build
docker-build: destroy_image
	docker build --tag ${APP_NAME}:${VERSION} -f ./Dockerfile .
	docker tag ${APP_NAME}:${VERSION} ${APP_NAME}:latest

.PHONY: docker-stop
docker-stop:
	docker container stop ${APP_NAME}

.PHONY: create_docker_network
create_docker_network:
	docker network create ${DOCKER_NETWORK} || true

.PHONY: docker-run
docker-run: destroy_container docker-build create_docker_network
	docker container run \
		--detach \
		--env LOG_LEVEL=warn \
		--env LOG_FORMAT=json \
		--env DATABASE_URL=${DATABASE_URL} \
		--env MSGQUEUE_NATS_URL=${NATS_URL} \
		--name ${APP_NAME} \
		--net ${DOCKER_NETWORK} \
		--restart always \
		${APP_NAME}

.PHONY: release
release:
	echo ${CR_PAT} | docker login ghcr.io --username ${CR_USER} --password-stdin
	docker build \
		--platform linux/arm64 \
		--tag ghcr.io/${CR_USER}/${APP_NAME}:${VERSION} \
		--tag ghcr.io/${CR_USER}/${APP_NAME}:latest \
		--label "org.opencontainers.image.source=https://github.com/${CR_USER}/${GH_REPO_NAME}" \
		--label "org.opencontainers.image.description=${APP_NAME} container image" \
		--label "org.opencontainers.image.licenses=NONE" \
		-f ./Dockerfile .
	docker push ghcr.io/${CR_USER}/${APP_NAME}:${VERSION}
	docker push ghcr.io/${CR_USER}/${APP_NAME}:latest


.PHONY: deploy
deploy:
	ssh ${CLOUD_REMOTE} ' \
		echo ${CR_PAT} | docker login ghcr.io --username ${CR_USER} --password-stdin; \
		docker pull ghcr.io/${CR_USER}/${APP_NAME}:${VERSION}; \
		docker pull ghcr.io/${CR_USER}/${APP_NAME}:latest; \
		docker container rm ${APP_NAME} -f; \
		docker network create ${DOCKER_NETWORK} || true; \
		docker container run \
		--detach \
		--env LOG_LEVEL=warn \
		--env LOG_FORMAT=json \
		--env DATABASE_URL=${DATABASE_URL} \
		--env MSGQUEUE_NATS_URL=${NATS_URL} \
		--name ${APP_NAME} \
		--net ${DOCKER_NETWORK} \
		--restart always \
		ghcr.io/${CR_USER}/${APP_NAME}; \
		'
