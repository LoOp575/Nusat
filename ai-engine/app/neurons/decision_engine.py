from __future__ import annotations

from app.math_core.normalization import clamp_0_100, round_score

DecisionName = str


def _risk_level(risk_score: float) -> str:
    if risk_score < 35:
        return "low"
    if risk_score < 70:
        return "medium"
    return "high"


def _confidence(dominance: float, risk_score: float, trap_probability: float) -> int:
    raw = 45.0 + dominance * 0.35 + (100.0 - risk_score) * 0.15 + (100.0 - trap_probability) * 0.1
    return round_score(raw)


def run_decision_engine(
    pressure: dict[str, float | int],
    neural_scores: dict[str, int],
    market_making: dict[str, float | int],
) -> dict[str, object]:
    buy_pressure = float(pressure["buyPressureIntegral"])
    sell_pressure = float(pressure["sellPressureIntegral"])
    velocity_raw = float(pressure["_momentumVelocityRaw"])
    acceleration_raw = float(pressure["_momentumAccelerationRaw"])
    volatility_pressure = float(pressure["volatilityPressure"])

    bullish = float(neural_scores["bullishPressure"])
    bearish = float(neural_scores["bearishPressure"])
    trap = float(neural_scores["trapProbability"])
    risk = float(neural_scores["riskScore"])
    liquidity_risk = float(market_making["liquidityRisk"])

    dominance = abs(bullish - bearish)
    has_strong_dominance = max(bullish, bearish) >= 65 and dominance >= 12

    decision: DecisionName
    trade_mode = "confirmation"
    dominant_side = "neutral"
    invalidation_hint = "Wait for cleaner structure and stronger scenario confirmation"
    reasons: list[str] = ["Signal mixed", "Dominance not strong", "Scenario not clear"]

    extreme_risk = risk >= 85 or trap >= 85 or liquidity_risk >= 90 or volatility_pressure >= 90

    if extreme_risk:
        decision = "AVOID"
        trade_mode = "no-trade"
        dominant_side = "neutral"
        invalidation_hint = "Avoid until risk, trap, or liquidity stress cools down"
        reasons = ["Risk extreme", "Trap or volatility elevated", "Liquidity condition unsafe"]
    elif (
        bullish >= 70
        and buy_pressure > sell_pressure
        and velocity_raw > 0
        and acceleration_raw >= 0
        and trap < 55
        and risk < 70
    ):
        decision = "LONG_NOW"
        trade_mode = "normal"
        dominant_side = "bullish"
        invalidation_hint = "Close below minor support invalidates long bias"
        reasons = ["Buy pressure dominant", "Momentum positive", "Trap probability controlled"]
    elif (
        bearish >= 70
        and sell_pressure > buy_pressure
        and velocity_raw < 0
        and acceleration_raw < 0
        and trap >= 60
        and risk < 75
    ):
        decision = "SHORT_NOW"
        trade_mode = "normal"
        dominant_side = "bearish"
        invalidation_hint = "Close above minor resistance invalidates short bias"
        reasons = ["Sell pressure dominant", "Momentum negative", "Breakdown risk active"]
    elif has_strong_dominance and (volatility_pressure >= 70 or liquidity_risk >= 70 or trap >= 65):
        decision = "SCALP_ONLY"
        trade_mode = "scalp"
        dominant_side = "bullish" if bullish > bearish else "bearish"
        invalidation_hint = "Use fast invalidation because risk filters are elevated"
        reasons = ["Dominance strong", "Risk filter elevated", "Better for short-duration execution"]
    else:
        decision = "WAIT_FOR_CONFIRMATION"
        trade_mode = "confirmation"
        dominant_side = "bullish" if bullish > bearish + 8 else "bearish" if bearish > bullish + 8 else "neutral"

    confidence = _confidence(max(bullish, bearish), risk, trap)
    if decision == "AVOID":
        confidence = round_score(clamp_0_100(max(risk, trap, liquidity_risk, volatility_pressure)))

    return {
        "decision": decision,
        "confidence": confidence,
        "tradeMode": trade_mode,
        "riskLevel": _risk_level(risk),
        "dominantSide": dominant_side,
        "invalidationHint": invalidation_hint,
        "dominantReasons": reasons,
    }
