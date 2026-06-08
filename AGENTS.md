# AGENTS.md — Minor_Project

Multimodal difficult airway prediction (3-class: Easy/Moderate/Difficult).
30 tabular params + 5 image modalities. Stack: PyTorch + FastAPI + MongoDB + Next.js + Ollama.

## Source of truth

- `project_plan.md` — design doc
- `configs/train_config.yaml` — hyperparams for the multimodal `Trainer` only (NOT loaded by standalone tabular/xgb/rf scripts)
- `.env.example` — all env vars (`MONGO_URL`, `JWT_SECRET`, `OLLAMA_URL`, `LLM_MODEL`, `MODEL_CHECKPOINT`, `MODEL_DEVICE`)

## Entrypoints & commands

| What | Command | Output |
|------|---------|--------|
| TabTransformer (tabular-only) | `python src/training/train_tabular.py` | `checkpoints/tabular_best.pt` |
| XGBoost baseline | `python src/training/train_xgboost.py` | `checkpoints/xgboost_best.json` |
| Random Forest baseline | `python src/training/train_randomforest.py` | `checkpoints/randomforest_best.pkl` |
| Regenerate synthetic data | `python scripts/generate_synthetic_data.py` | `dataset.xlsx` (2500 rows) |
| Run API | `uvicorn src.deploy.api:app --host 0.0.0.0 --port 8000` | FastAPI `:8000` (`/health` ready check) |
| Run Frontend (dev) | `cd frontend && npm install && npm run dev` | Next.js `:3000` |
| Docker Compose | `docker-compose up --build` | API + Frontend + MongoDB + Ollama |
| Seed DB users | `docker exec -it minor_project-api-1 python scripts/seed_db.py` | admin/doctor1 users |

No Makefile, no `pyproject.toml`, no pre-commit, no `pytest` (see "Tests" below).

## Architecture

```
                          ┌─────────────────┐
                          │  Next.js (3000)  │  (output: 'standalone' for Docker)
                          │  React Dashboard │
                          └────────┬────────┘
                                   │ HTTP
                          ┌────────▼────────┐
                          │ FastAPI (8000)   │  JWT auth, role-based (admin/doctor/viewer)
                          │ Auth/CRUD/ML/LLM │
                          └──┬──────┬───────┘
                      ┌──────▼──┐ ┌─▼────────┐
                      │ MongoDB │ │ Ollama   │  default model: qvac/medpsy
                      │  (27017)│ │ (11434)  │
                      └─────────┘ └──────────┘
```

- **Frontend**: Next.js 14, Tailwind, Recharts, lucide-react — `frontend/`
- **Backend**: FastAPI + Motor (async Mongo) — `src/deploy/`
- **ML**: TabTransformer (TabularModel) — `src/models/tabular_model.py`
- **LLM**: Ollama, prompt assembly in `src/deploy/llm_assistant.py`

## Backend layout (src/deploy/)

- `api.py` — FastAPI app + `lifespan` (connect DB, build indexes, `load_model()`)
- `config.py` — Pydantic settings from env (see `.env.example`)
- `database.py` — Motor connection + index setup
- `auth.py` — JWT + bcrypt + `require_role(...)` decorator
- `model_loader.py` — builds TabularModel, loads checkpoint into a module-global singleton
- `llm_assistant.py` — Ollama prompt engineering (summary + recommendations)
- `routers/{auth,patients,predictions}.py` — `/api/{auth,patients,predictions}/*`
- `export.py` — ONNX export (multimodal model, opset 17)
- `Dockerfile.api` / `Dockerfile.ui` — image builds

## Key gotchas (verified from code)

- **Predictions router is NOT scaling inputs**: `src/deploy/routers/predictions.py:19-38` builds a `DataFrame` with raw values and passes them straight to `predict_tabular`. It imports `NUMERICAL_COLS` from `preprocessing.py` but never applies the `StandardScaler` that training used. Inference will produce wrong probabilities unless the caller normalizes upstream. Fix: load the saved `StandardScaler` artifact in the router before tensorizing.
- **Multimodal trainer drops categoricals**: `src/training/trainer.py:61` and `:95` hardcode `categorical_indices = []`. All 30 tabular features flow through the model as one numerical tensor. The standalone `train_tabular.py` (which is what produced `tabular_best.pt`) does handle 22 categoricals + 7 numericals correctly.
- **Column lists duplicated 4×**: `CATEGORICAL_COLS` (22) and `NUMERICAL_COLS` (7) are copy-pasted in `preprocessing.py`, `train_tabular.py`, `train_xgboost.py`, `train_randomforest.py`. Plus `model_loader.py:15` hardcodes a `cat_cardinalities` list of 22 ints that must match. A schema change needs all 5 files updated.
- **Config drift**: `train_config.yaml` says `batch_size: 16`, `use_amp: true`, `grad_accum: 2` for the multimodal trainer. The standalone tabular scripts hardcode `BATCH_SIZE = 32`, `LR = 1e-3`, no AMP. The yaml is only used by `trainer.py`.
- **No `__main__` on the multimodal trainer**: `src/training/trainer.py` is a class only. There is no `train_multimodal.py` to drive it end-to-end — you must write a dataloader/dataset wiring (see `src/data/{dataset,loaders,transforms}.py`) and call `Trainer(...).fit()`.
- **No multimodal image data**: `data/raw/` is empty. Only synthetic tabular `dataset.xlsx` exists. The image encoder (`src/models/image_encoder.py`) and fusion (`src/models/fusion.py`) code is present but not exercised by any shipped training entrypoint.
- **`tests/` is empty** — there is no test suite. CI does import smoke checks only (see below), not `pytest`.
- **ONNX export mismatch**: `src/deploy/export.py:6-7` uses `dummy_numerical = torch.randn(1, 20)` and `dummy_cat = []`, which do not match the TabularModel (7 numerical, 22 categorical). Exporting the current best tabular model with this helper will trace a wrong shape.
- **Ollama is non-blocking but silently falls back**: `llm_assistant.py` returns the canned string in `_call_ollama` exceptions; the API always 200s. If the LLM feature "stopped working", check the Ollama container first.
- **GPU constraint**: 4GB VRAM (GTX 1650 Ti). `MODEL_DEVICE=cpu` is the default in `docker-compose.yml` and `.env.example`; switch to `cuda` only for local training.
- **Docker volumes are host absolute paths** (`D:/mongodb/data`, `D:/ollama/models`) — breaks on non-Windows. Edit `docker-compose.yml` before running on Linux/macOS.
- **Compose container name for seeding**: `<project-prefix>-api-1`, e.g. `minor_project-api-1` (from `deploy-docs.md`). `<api-container>` placeholder in older docs is wrong.

## CI (`.github/workflows/deploy.yml`)

Triggers on push/PR to `main`. Four jobs:

1. `lint` — `ruff check src/ --ignore E402,F403,F401`, then `black --check src/` (both non-fatal: `|| true` / `--exit-zero`)
2. `test-backend` — installs requirements, runs `python -c "from src.deploy.config import settings; ..."` import smoke tests only (spins up Mongo service)
3. `test-frontend` — `npm ci`, `npm run lint`, `npm run build`
4. `build-docker` — needs all three; pushes `api` and `frontend` images to `ghcr.io` on push to main

No `pytest`, no real unit tests anywhere.

## Pre-trained checkpoints

| File | Accuracy | AUC-ROC |
|------|----------|---------|
| `checkpoints/tabular_best.pt` | 0.859 | 0.970 |
| `checkpoints/xgboost_best.json` | 0.845 | 0.962 |
| `checkpoints/randomforest_best.pkl` | 0.813 | 0.953 |

These were produced by the standalone tabular scripts (which DO handle categoricals), not the broken multimodal trainer.

## Default users (after `seed_db.py`)

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | admin |
| doctor1 | doctor123 | doctor |

## Subagents (`.opencode/agent/`)

`@ml-engineer`, `@devops-engineer`, `@frontend-dev`, `@backend-db-engineer`, `@data-scientist` — see those files for domain scopes.
