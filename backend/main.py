from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import os

# ────────────────────────────────────────────────────────────────────────────
# Legge il dominio del frontend dall'ambiente.
# In sviluppo locale imposta: FRONTEND_ORIGIN=http://localhost:3000
# In produzione imposta:      FRONTEND_ORIGIN=https://tuodominio.com
# Se la variabile non è impostata, di default permette solo localhost:3000.
# ────────────────────────────────────────────────────────────────────────────
FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "http://localhost:3000")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],   # ✅ non più "*"
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🧠 INPUT
class UserInput(BaseModel):
    age: int = Field(default=0)
    salary: float = Field(default=0)
    sector: str = Field(default="other")
    savings: float = Field(default=0)
    country: str = Field(default="italia")
    expenses: float = Field(default=0)


# 📊 SETTORI
def sector_multiplier(sector: str):
    s = sector.lower()
    mapping = {
        "tecnologie digitali e informatiche": 1.035,
        "ricerca e sviluppo": 1.04,
        "it": 1.035,
        "digital": 1.035,
        "finanza e assicurazioni": 1.03,
        "attività finanziarie e assicurative": 1.03,
        "attività immobiliari": 1.025,
        "servizi professionali e scientifici": 1.025,
        "energia e utilities": 1.02,
        "pubblica amministrazione e difesa": 1.015,
        "istruzione": 1.015,
        "sanità e assistenza sociale": 1.02,
        "industria manifatturiera": 1.02,
        "costruzioni": 1.02,
        "commercio e riparazioni": 1.02,
        "logistica e trasporti": 1.02,
        "alloggio e ristorazione": 1.015,
        "arte, sport e intrattenimento": 1.02,
        "servizi domestici": 1.01,
        "servizi di supporto alle imprese": 1.02,
        "servizi ambientali e gestione rifiuti": 1.02,
        "servizi di sicurezza privata": 1.02,
        "agricoltura e pesca": 1.015,
        "settori emergenti e innovativi": 1.035,
        "altri servizi": 1.02
    }
    return mapping.get(s, 1.02)


# 🌍 PAESI
def country_multiplier(country: str):
    c = country.lower()
    if c in ["germania", "germany", "netherlands", "olanda", "svezia"]:
        return 1.02
    elif c in ["italia", "italy", "spagna", "spain"]:
        return 1.015
    else:
        return 1.02


# 📈 CRESCITA SALARIO 20 ANNI
def salary_projection(base_salary, sector, country):
    sec = sector_multiplier(sector)
    ctry = country_multiplier(country)
    salary = base_salary
    result = []
    for _ in range(20):
        salary *= (sec * ctry)
        result.append(round(salary, 2))
    return result


# 🏦 CAPACITÀ FINANZIARIA
def financial_capacity(salary, expenses):
    free = max(salary - expenses, 0)
    return free * 0.35


# 💰 PATRIMONIO FUTURO
def future_wealth(salary, expenses, savings):
    wealth = savings
    for _ in range(20):
        salary *= 1.02
        expenses *= 1.03
        saving = max(salary - expenses, 0)
        invested = saving * 0.7
        wealth = (wealth + invested * 12) * 1.05
    return round(wealth, 2)


# 🚀 API
@app.post("/analyze")
def analyze(data: UserInput):
    salary_growth = salary_projection(
        data.salary,
        data.sector,
        data.country
    )
    monthly_capacity = financial_capacity(data.salary, data.expenses)
    return {
        "salary_growth_20y": salary_growth,
        "max_financing": round(monthly_capacity * 12 * 5, 2),
        "future_wealth": future_wealth(
            data.salary,
            data.expenses,
            data.savings
        )
    }
