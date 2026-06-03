from __future__ import annotations

from app.math_core.calculus import (
    momentum_acceleration,
    momentum_velocity,
    pressure_integral,
    volatility_pressure,
)
from app.math_core.normalization import clamp_0_100, normalize_signed, percentage_share, round_score
from app.schemas.market import MarketInput


def run_pressure_neuron(market: MarketInput) -> dict[str, float | int]:
    candles = market.candles
    closes = [candle.close for candle in candles]

    directional_pressure = []
    for candle in candles:
        average_price = max((candle.open + candle.close) / 2.0, 1e-9)
        candle_move = candle.close - candle.open
        directional_pressure.append((candle_move / average_price) * candle.volume)

    buy_curve = [max(value, 0.0) for value in directional_pressure]
    sell_curve = [abs(min(value, 0.0)) for value in directional_pressure]

    buy_raw = pressure_integral(buy_curve)
    sell_raw = pressure_integral(sell_curve)
    total_raw = buy_raw + sell_raw

    velocity_raw = momentum_velocity(closes)
    acceleration_raw = momentum_acceleration(closes)
    volatility_raw = volatility_pressure(closes)

    velocity_scale = max(market.price * 0.05, 1e-9)
    acceleration_scale = max(market.price * 0.03, 1e-9)

    return {
        "buyPressureIntegral": round_score(percentage_share(buy_raw, total_raw)),
        "sellPressureIntegral": round_score(percentage_share(sell_raw, total_raw)),
        "momentumVelocity": round_score(normalize_signed(velocity_raw, velocity_scale) * 100.0),
        "momentumAcceleration": round_score(normalize_signed(acceleration_raw, acceleration_scale) * 100.0),
        "volatilityPressure": round_score(clamp_0_100(volatility_raw * 12.0)),
        "_buyPressureRaw": buy_raw,
        "_sellPressureRaw": sell_raw,
        "_momentumVelocityRaw": velocity_raw,
        "_momentumAccelerationRaw": acceleration_raw,
        "_volatilityRaw": volatility_raw,
    }
