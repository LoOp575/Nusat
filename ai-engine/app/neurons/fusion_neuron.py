from __future__ import annotations

from app.math_core.neural_math import neural_score
from app.math_core.normalization import clamp, normalize_ratio, round_score
from app.schemas.market import MarketInput


def _n(value: float) -> float:
    return clamp(value, 0.0, 100.0) / 100.0


def run_fusion_neuron(
    market: MarketInput,
    pressure: dict[str, float | int],
    market_making: dict[str, float | int],
) -> dict[str, int]:
    buy = _n(float(pressure["buyPressureIntegral"]))
    sell = _n(float(pressure["sellPressureIntegral"]))
    velocity_raw = float(pressure["_momentumVelocityRaw"])
    acceleration_raw = float(pressure["_momentumAccelerationRaw"])
    volatility = _n(float(pressure["volatilityPressure"]))
    liquidity_risk = _n(float(market_making["liquidityRisk"]))

    funding_rate = market.funding_rate or 0.0
    open_interest = market.open_interest or 0.0
    long_short_ratio = market.long_short_ratio or 1.0

    change_positive = normalize_ratio(market.change_24h, 0.0, 15.0)
    change_negative = normalize_ratio(-market.change_24h, 0.0, 15.0)
    volume_pressure = normalize_ratio(market.volume_24h, 10_000_000.0, 500_000_000.0)
    open_interest_pressure = normalize_ratio(open_interest, 5_000_000.0, 250_000_000.0)
    long_bias = normalize_ratio(long_short_ratio, 1.0, 2.2)
    short_bias = normalize_ratio(1.0 / max(long_short_ratio, 1e-9), 1.0, 2.2)
    funding_abs = normalize_ratio(abs(funding_rate), 0.0, 0.04)

    velocity_pos = 1.0 if velocity_raw > 0 else 0.0
    velocity_neg = 1.0 if velocity_raw < 0 else 0.0
    acceleration_pos = 1.0 if acceleration_raw >= 0 else 0.0
    acceleration_neg = 1.0 if acceleration_raw < 0 else 0.0

    bullish_pressure = neural_score(
        [buy, velocity_pos, acceleration_pos, change_positive, long_bias, volume_pressure],
        [1.35, 0.9, 0.55, 0.95, 0.55, 0.45],
        bias=-1.7,
    )
    bearish_pressure = neural_score(
        [sell, velocity_neg, acceleration_neg, change_negative, short_bias, volume_pressure],
        [1.35, 0.9, 0.55, 0.95, 0.55, 0.45],
        bias=-1.7,
    )
    trap_probability = neural_score(
        [volatility, funding_abs, abs(long_bias - short_bias), open_interest_pressure, liquidity_risk],
        [1.1, 0.9, 0.9, 0.65, 1.1],
        bias=-1.45,
    )
    risk_score = neural_score(
        [volatility, trap_probability / 100.0, liquidity_risk, funding_abs],
        [1.25, 1.05, 1.15, 0.7],
        bias=-1.25,
    )
    liquidity_dominance = neural_score(
        [volume_pressure, open_interest_pressure, 1.0 - liquidity_risk],
        [0.9, 0.7, 0.85],
        bias=-1.0,
    )
    market_strength = neural_score(
        [max(bullish_pressure, bearish_pressure) / 100.0, volume_pressure, 1.0 - risk_score / 100.0],
        [1.1, 0.75, 0.65],
        bias=-0.85,
    )

    return {
        "bullishPressure": round_score(bullish_pressure),
        "bearishPressure": round_score(bearish_pressure),
        "trapProbability": round_score(trap_probability),
        "riskScore": round_score(risk_score),
        "liquidityDominance": round_score(liquidity_dominance),
        "marketStrength": round_score(market_strength),
    }
