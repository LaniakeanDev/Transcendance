PROJECT := Transcendance-dev
GOINFRE := /goinfre/$(USER)
DEST    := $(GOINFRE)/$(PROJECT)

COMPOSE := $(shell \
	if docker compose version >/dev/null 2>&1; then echo "docker compose"; \
	elif command -v podman-compose >/dev/null 2>&1; then echo "podman-compose"; \
	else echo "docker-compose"; fi)

# ----------------------------- Docker / Podman -----------------------------

## up: build the images and start the stack (single command)
# --force-recreate: podman-compose keeps the old container after a rebuild otherwise.
up:
	$(COMPOSE) up --build --force-recreate -d
	@echo "App available at https://localhost:$${HTTPS_PORT:-3000} (self-signed certificate)"

down:
	$(COMPOSE) down

stop:
	$(COMPOSE) stop
start:
	$(COMPOSE) start

logs:
	$(COMPOSE) logs -f

## migrate: apply Prisma migrations to the remote Supabase DB (opt-in)
migrate:
	$(COMPOSE) -f compose.tools.yaml run --rm migrate

re: down up

clean:
	$(COMPOSE) down -v --rmi local

.PHONY: up down stop start logs migrate re clean

# ------------------------------- Goinfre setup (Not needed for review!!)---------------------------------

install: goinfre
	npm i && npx prisma generate

goinfre:
	@mkdir -p $(GOINFRE)
	@npm config set cache "$(GOINFRE)/.npm-cache"
	@here="$$(pwd -P)"; \
	case "$$here" in \
	  $(GOINFRE)/*) echo "Already in goinfre : $$here" ;; \
	  *) echo "Move to $$here -> $(DEST)"; \
	     rm -rf "$(DEST)"; \
	     mv "$$here" "$(DEST)"; \
	     ln -sfn "$(DEST)" "$$here"; \
	     echo "Done. Reopen the project with $$here then do again 'make install'." ;; \
	esac

.PHONY: install goinfre
