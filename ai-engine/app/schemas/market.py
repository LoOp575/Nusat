from __future__ import annotations

from typing import List

from pydantic import BaseModel, ConfigDict, Field


class Candle(BaseModel):
    timestamp: int
    open: float
    high: float
    low: float
    close: float
    volume: float


class EngineSettings(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    inventory: float = 0.0
    risk_aversion: float = Field(default=0.1, alias="riskAversion")
    time_remaining: float = Field(default=1.0, alias="timeRemaining")
    liquidity_k: float = Field(default=1.5, alias="liquidityK")


class MarketInput(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    symbol: str
    price: float
    change_24h: float = Field(alias="change24h")
    volume_24h: float = Field(alias="volume24h")
    funding_rate: float = Field(alias="fundingRate")
    open_interest: float = Field(alias="openInterest")
    long_short_ratio: float = Field(alias="longShortRatio")
    candles: List[Candle]
    settings: EngineSettings = Field(default_factory=EngineSettings)
