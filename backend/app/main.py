from fastapi import FastAPI




app = FastAPI()

@app("/")
def index():
    return "nice"