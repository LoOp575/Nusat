from __future__ import annotations

import math
from typing import Mapping


def reservation_price(
    mid_price: float,
    inventory: float,
    risk_aversion: float,
    volatility_squared: float,
    time_remaining: float,
) -> float:
    return mid_price - inventory * risk_aversion * volatility_squared * time_remaining


def total_spread(
    risk_aversion: float,
    volatility_squared: float,
    time_remaining: float,
    liquidity_k: float,
) -> float:
    safe_risk = max(float(risk_aversion), 1e-9)
    safe_k = max(float(liquidity_k), 1e-9)
    inventory_risk_term = safe_risk * volatility_squared * time_remaining
    liquidity_term = (2.0 / safe_risk) * math.log(1.0 + safe_risk / safe_k)
    return max(0.0, inventory_risk_term + liquidity_term)


def quote_bid_ask(params: Mapping[str, float]) -> dict[str, float]:
    reservation = reservation_price(
        mid_price=float(params["mid_price"]),
        inventory=float(params.get("inventory", 0.0)),
        risk_aversion=float(params.get("risk_aversion", 0.1)),
        volatility_squared=float(params.get("volatility_squared", 0.0)),
        time_remaining=float(params.get("time_remaining", 1.0)),
    )
    spread = total_spread(
        risk_aversion=float(params.get("risk_aversion", 0.1)),
        volatility_squared=float(params.get("volatility_squared", 0.0)),
        time_remaining=float(params.get("time_remaining", 1.0)),
        liquidity_k=float(params.get("liquidity_k", 1.5)),
    )
    return {
        "reservation_price": reservation,
        "total_spread": spread,
        "bid_price": reservation - spread / 2.0,
        "ask_price": reservation + spread / 2.0,
    }
