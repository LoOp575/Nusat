from __future__ import annotations

import math
from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.neurons.avellaneda_neuron import run_avellaneda_neuron
from app.neurons.decision_engine import run_decision_engine
from app.neurons.fusion_neuron import run_fusion_neuron
from app.neurons.pressure_neuron import run_pressure_neuron
from app.neurons.scenario_neuron import run_scenario_neuron
from app.schemas.market import MarketInput

app = FastAPI(
    title="Vision Market Agent Python Neuron Engine",
    version="0.1.1",
    description="Backend-only AI neuron math engine for visual crypto market analysis. No auto-trading.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _safe_number(value: Any, fallback: float = 0.0) -> float:
    try:
        number = float(value)
    except (TypeError, ValueError):
        return fallback
    if not math.isfinite(number):
        return fallback
    return number


def _safe_int(value: Any, fallback: int = 0) -> int:
    return int(round(max(0.0, min(100.0, _safe_number(value, fallback)))))


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


def _sanitize_pressure(pressure: dict[str, Any]) -> dict[str, int]:
    return {
        "buyPressureIntegral": _safe_int(pressure.get("buyPressureIntegral")),
        "sellPressureIntegral": _safe_int(pressure.get("sellPressureIntegral")),
        "momentumVelocity": _safe_int(pressure.get("momentumVelocity")),
        "momentumAcceleration": _safe_int(pressure.get("momentumAcceleration")),
        "volatilityPressure": _safe_int(pressure.get("volatilityPressure")),
    }


def _sanitize_scores(scores: dict[str, Any]) -> dict[str, int]:
    return {
        "bullishPressure": _safe_int(scores.get("bullishPressure")),
        "bearishPressure": _safe_int(scores.get("bearishPressure")),
        "trapProbability": _safe_int(scores.get("trapProbability")),
        "riskScore": _safe_int(scores.get("riskScore")),
        "liquidityDominance": _safe_int(scores.get("liquidityDominance")),
        "marketStrength": _safe_int(scores.get("marketStrength")),
    }


def _sanitize_market_making(market_making: dict[str, Any], fallback_price: float) -> dict[str, float | int]:
    reservation = _safe_number(market_making.get("reservationPrice"), fallback_price)
    total_spread = max(0.0, _safe_number(market_making.get("totalSpread"), 0.0))
    bid = _safe_number(market_making.get("bidPrice"), reservation)
    ask = _safe_number(market_making.get("askPrice"), reservation)

    return {
        "reservationPrice": round(reservation, 6),
        "totalSpread": round(total_spread, 6),
        "bidPrice": round(bid, 6),
        "askPrice": round(ask, 6),
        "liquidityRisk": _safe_int(market_making.get("liquidityRisk")),
    }


def _sanitize_decision(decision: dict[str, Any]) -> dict[str, object]:
    allowed_decisions = {"LONG_NOW", "SHORT_NOW", "SCALP_ONLY", "WAIT_FOR_CONFIRMATION", "AVOID"}
    allowed_sides = {"bullish", "bearish", "neutral"}
    allowed_risk = {"low", "medium", "high"}

    final_decision = str(decision.get("decision", "WAIT_FOR_CONFIRMATION"))
    dominant_side = str(decision.get("dominantSide", "neutral"))
    risk_level = str(decision.get("riskLevel", "medium"))
    reasons = decision.get("dominantReasons", [])

    return {
        "decision": final_decision if final_decision in allowed_decisions else "WAIT_FOR_CONFIRMATION",
        "confidence": _safe_int(decision.get("confidence"), 50),
        "tradeMode": str(decision.get("tradeMode", "confirmation")),
        "riskLevel": risk_level if risk_level in allowed_risk else "medium",
        "dominantSide": dominant_side if dominant_side in allowed_sides else "neutral",
        "invalidationHint": str(decision.get("invalidationHint", "Wait for cleaner confirmation")),
        "dominantReasons": [str(reason) for reason in reasons[:5]] if isinstance(reasons, list) else [],
    }


@app.get("/")
def health_check() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "Vision Market Agent Python Neuron Engine",
    }


@app.get("/health")
def health_alias() -> dict[str, str]:
    return health_check()


@app.post("/analyze")
def analyze_market(market: MarketInput):
    try:
        pressure_raw = run_pressure_neuron(market)
        market_making_raw = run_avellaneda_neuron(market)
        neural_scores_raw = run_fusion_neuron(market, pressure_raw, market_making_raw)
        scenarios_raw = run_scenario_neuron(pressure_raw, neural_scores_raw, market_making_raw)
        decision_raw = run_decision_engine(pressure_raw, neural_scores_raw, market_making_raw)

        pressure = _sanitize_pressure(pressure_raw)
        neural_scores = _sanitize_scores(neural_scores_raw)
        market_making = _sanitize_market_making(market_making_raw, market.price)
        decision = _sanitize_decision(decision_raw)
        scenarios = [
            {
                "name": str(scenario.get("name", "Unknown Scenario")),
                "probability": _safe_int(scenario.get("probability")),
            }
            for scenario in scenarios_raw
            if isinstance(scenario, dict)
        ]

        if not scenarios:
            scenarios = [
                {"name": "Breakout Continuation", "probability": 34},
                {"name": "Liquidity Sweep Reversal", "probability": 33},
                {"name": "Range Cooldown", "probability": 33},
            ]

        return {
            "symbol": market.symbol.upper(),
            "decision": decision,
            "pressure": pressure,
            "neuralScores": neural_scores,
            "marketMaking": market_making,
            "scenarios": scenarios,
            "dataQuality": _analysis_data_quality(market),
        }
    except Exception as exc:
        return JSONResponse(
            status_code=500,
            content={
                "ok": False,
                "reason": "python_engine_internal_error",
                "message": "Python AI Neuron Engine crashed during analysis",
                "details": f"{type(exc).__name__}: {exc}",
            },
        )
