from fastapi import FastAPI
from sqlmodel import SQLModel, create_engine

# Boilerplate DB connection logic
# engine = create_engine("postgresql://user:password@localhost/acuity_db")

app = FastAPI(title="Acuity AI Microservice")

@app.on_event("startup")
def on_startup():
    print("Initializing AI microservice...")

@app.get("/")
def read_root():
    return {"status": "running", "service": "python-ai"}
