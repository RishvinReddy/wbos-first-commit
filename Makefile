.PHONY: test local-api build

test:
	pip install -r tests/requirements-dev.txt
	PYTHONPATH=src pytest tests/

build:
	sam build

local-api: build
	sam local start-api --env-vars env.json

