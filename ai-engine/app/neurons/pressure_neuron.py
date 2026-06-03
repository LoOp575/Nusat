from __future__ import annotations

from app.math_core.calculus import (
    momentum_acceleration,
    momentum_velocity,
    pressure_integral,
    volatility_pressure,
)
from app.math_core.normalization import clamp_0_100, normalize_signed, percentage_share, round_score
from app.schemas.market import MarketInput


def _pressure_from_candles(market: MarketInput) -> tuple[list[float], list[float], list[float]]:
    closes = [candle.close for candle in market.candles]
    directional_pressure = []

    for candle in market.candles:
        average_price = max((candle.open + candle.close) / 2.0, 1e-9)
        candle_move = candle.close - candle.open
        directional_pressure.append((candle_move / average_price) * candle.volume)

    buy_curve = [max(value, 0.0) for value in directional_pressure]
    sell_curve = [abs(min(value, 0.0)) for value in directional_pressure]
    return closes, buy_curve, sell_curve


def _pressure_from_price_series(market: MarketInput) -> tuple[list[float], list[float], list[float]]:
    prices = [point.price for point in market.price_series]
    if len(prices) < 2:
        return prices, [], []

    volume_proxy = market.volume_24h / max(len(prices) - 1, 1)
    buy_curve = []
    sell_curve = []

    for previous, current in zip(prices[:-1], prices[1:]):
        change = current - previous
        average_price = max((previous + current) / 2.0, 1e-9)
        pressure_value = abs(change / average_price) * volume_proxy
        if change >= 0:
            buy_curve.append(pressure_value)
            sell_curve.append(0.0)
        else:
            buy_curve.append(0.0)
            sell_curve.append(pressure_value)

    return prices, buy_curve, sell_curve


def run_pressure_neuron(market: MarketInput) -> dict[str, float | int]:
    if market.candles:
        closes, buy_curve, sell_curve = _pressure_from_candles(market)
    else:
        closes, buy_curve, sell_curve = _pressure_from_price_series(market)

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
