from __future__ import annotations

from app.math_core.normalization import clamp


def _normalize_probabilities(raw_values: list[float]) -> list[int]:
    positive_values = [max(1.0, value) for value in raw_values]
    total = sum(positive_values)
    probabilities = [int(round(value / total * 100.0)) for value in positive_values]
    drift = 100 - sum(probabilities)
    if probabilities:
        largest_index = max(range(len(probabilities)), key=lambda index: probabilities[index])
        probabilities[largest_index] += drift
    return probabilities


def run_scenario_neuron(
    pressure: dict[str, float | int],
    neural_scores: dict[str, int],
    market_making: dict[str, float | int],
) -> list[dict[str, int | str]]:
    bullish = neural_scores["bullishPressure"]
    bearish = neural_scores["bearishPressure"]
    trap = neural_scores["trapProbability"]
    risk = neural_scores["riskScore"]
    strength = neural_scores["marketStrength"]
    volatility = float(pressure["volatilityPressure"])
    liquidity_risk = float(market_making["liquidityRisk"])

    breakout_raw = bullish * 0.45 + strength * 0.3 + (100 - risk) * 0.15 + max(0, bullish - bearish) * 0.1
    sweep_raw = trap * 0.4 + liquidity_risk * 0.25 + volatility * 0.2 + max(bullish, bearish) * 0.15
    range_raw = (100 - abs(bullish - bearish)) * 0.4 + (100 - volatility) * 0.25 + (100 - strength) * 0.2 + (100 - trap) * 0.15

    probabilities = _normalize_probabilities([
        clamp(breakout_raw, 1.0, 100.0),
        clamp(sweep_raw, 1.0, 100.0),
        clamp(range_raw, 1.0, 100.0),
    ])

    return [
        {"name": "Breakout Continuation", "probability": probabilities[0]},
        {"name": "Liquidity Sweep Reversal", "probability": probabilities[1]},
        {"name": "Range Cooldown", "probability": probabilities[2]},
    ]
