from __future__ import annotations

from typing import List, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


class Candle(BaseModel):
    timestamp: int
    open: float
    high: float
    low: float
    close: float
    volume: float


class PricePoint(BaseModel):
    timestamp: int
    price: float


class EngineInputDataQuality(BaseModel):
    quality: Literal["full", "partial", "insufficient"] = "insufficient"
    has_price: bool = Field(default=False, alias="hasPrice")
    has_volume: bool = Field(default=False, alias="hasVolume")
    has_candles: bool = Field(default=False, alias="hasCandles")
    has_price_series: bool = Field(default=False, alias="hasPriceSeries")
    missing: List[str] = Field(default_factory=list)

    model_config = ConfigDict(populate_by_name=True)


class EngineSettings(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    inventory: float = 0.0
    risk_aversion: float = Field(default=0.1, alias="riskAversion")
    time_remaining: float = Field(default=1.0, alias="timeRemaining")
    liquidity_k: float = Field(default=1.5, alias="liquidityK")


class MarketInput(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    symbol: str
    name: Optional[str] = None
    price: float
    change_24h: float = Field(alias="change24h")
    volume_24h: float = Field(alias="volume24h")
    market_cap: Optional[float] = Field(default=None, alias="marketCap")
    funding_rate: Optional[float] = Field(default=None, alias="fundingRate")
    open_interest: Optional[float] = Field(default=None, alias="openInterest")
    long_short_ratio: Optional[float] = Field(default=None, alias="longShortRatio")
    candles: List[Candle] = Field(default_factory=list)
    price_series: List[PricePoint] = Field(default_factory=list, alias="priceSeries")
    data_quality: EngineInputDataQuality = Field(default_factory=EngineInputDataQuality, alias="dataQuality")
    settings: EngineSettings = Field(default_factory=EngineSettings)
