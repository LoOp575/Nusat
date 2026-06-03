from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.neurons.avellaneda_neuron import run_avellaneda_neuron
from app.neurons.decision_engine import run_decision_engine
from app.neurons.fusion_neuron import run_fusion_neuron
from app.neurons.pressure_neuron import run_pressure_neuron
from app.neurons.scenario_neuron import run_scenario_neuron
from app.schemas.analysis import AnalysisOutput
from app.schemas.market import MarketInput

app = FastAPI(
    title="Vision Market Agent Python Neuron Engine",
    version="0.1.0",
    description="Backend-only AI neuron math engine for visual crypto market analysis. No auto-trading.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health_check() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "Vision Market Agent Python Neuron Engine",
    }


def _analysis_data_quality(market: MarketInput) -> dict[str, object]:
    notes: list[str] = []
    if market.candles:
        quality = "full"
        notes.append("candles_available")
    elif market.price_series:
        quality = "partial"
        notes.append("price_series_only")
        notes.append("pressure_uses_volume_proxy")
    else:
        quality = "insufficient"
        notes.append("missing_candles_or_price_series")

    if market.funding_rate is None:
        notes.append("missing_funding_rate")
    if market.open_interest is None:
        notes.append("missing_open_interest")
    if market.long_short_ratio is None:
        notes.append("missing_long_short_ratio")

    return {"quality": quality, "notes": notes}


@app.post("/analyze", response_model=AnalysisOutput, response_model_by_alias=True)
def analyze_market(market: MarketInput) -> dict[str, object]:
    pressure = run_pressure_neuron(market)
    market_making = run_avellaneda_neuron(market)
    neural_scores = run_fusion_neuron(market, pressure, market_making)
    scenarios = run_scenario_neuron(pressure, neural_scores, market_making)
    decision = run_decision_engine(pressure, neural_scores, market_making)

    public_pressure = {key: value for key, value in pressure.items() if not key.startswith("_")}
    public_market_making = {
        key: value
        for key, value in market_making.items()
        if key in {"reservationPrice", "totalSpread", "bidPrice", "askPrice", "liquidityRisk"}
    }

    return {
        "symbol": market.symbol.upper(),
        "decision": decision,
        "pressure": public_pressure,
        "neuralScores": neural_scores,
        "marketMaking": public_market_making,
        "scenarios": scenarios,
        "dataQuality": _analysis_data_quality(market),
    }
