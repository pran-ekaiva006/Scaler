.PHONY: run run-backend run-frontend

run:
	@echo "Starting servers concurrently..."
	@make -j 2 run-backend run-frontend

run-backend:
	@echo "Starting FastAPI backend..."
	cd backend && source venv/bin/activate && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

run-frontend:
	@echo "Starting Next.js frontend..."
	cd frontend && npm run dev -- -p 3000
