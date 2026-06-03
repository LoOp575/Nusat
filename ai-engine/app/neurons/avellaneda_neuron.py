from __future__ import annotations

import numpy as np

from app.math_core.avellaneda import quote_bid_ask
from app.math_core.normalization import clamp_0_100, round_score, safe_divide
from app.schemas.market import MarketInput


def _estimate_volatility_squared(market: MarketInput) -> float:
    ranges = []
    for candle in market.candles:
        mid = max((candle.high + candle.low) / 2.0, 1e-9)
        ranges.append((candle.high - candle.low) / mid)

    if not ranges:
        return 0.0

    range_volatility = float(np.std(ranges)) if len(ranges) > 1 else float(ranges[0])
    price_volatility = max(range_volatility * market.price, 1e-9)
    return price_volatility ** 2


def run_avellaneda_neuron(market: MarketInput) -> dict[str, float | int]:
    settings = market.settings
    volatility_squared = _estimate_volatility_squared(market)

    quotes = quote_bid_ask(
        {
            "mid_price": market.price,
            "inventory": settings.inventory,
            "risk_aversion": settings.risk_aversion,
            "volatility_squared": volatility_squared,
            "time_remaining": settings.time_remaining,
            "liquidity_k": settings.liquidity_k,
        }
    )

    spread_percent = abs(safe_divide(quotes["total_spread"], market.price, 0.0)) * 100.0
    spread_pressure = clamp_0_100(spread_percent * 18.0)
    inventory_pressure = clamp_0_100(abs(settings.inventory) * 10.0)
    liquidity_k_pressure = clamp_0_100(100.0 / max(settings.liquidity_k, 1e-9))
    liquidity_risk = round_score(spread_pressure * 0.55 + inventory_pressure * 0.2 + liquidity_k_pressure * 0.25)

    return {
        "reservationPrice": round(quotes["reservation_price"], 6),
        "totalSpread": round(quotes["total_spread"], 6),
        "bidPrice": round(quotes["bid_price"], 6),
        "askPrice": round(quotes["ask_price"], 6),
        "spreadPressure": round_score(spread_pressure),
        "liquidityRisk": liquidity_risk,
        "_volatilitySquared": volatility_squared,
    }
