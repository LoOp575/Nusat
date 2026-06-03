from __future__ import annotations

from typing import List, Literal

from pydantic import BaseModel, ConfigDict, Field


class AliasModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True)


class DecisionOutput(AliasModel):
    decision: Literal["LONG_NOW", "SHORT_NOW", "SCALP_ONLY", "WAIT_FOR_CONFIRMATION", "AVOID"]
    confidence: int
    trade_mode: str = Field(alias="tradeMode")
    risk_level: Literal["low", "medium", "high"] = Field(alias="riskLevel")
    dominant_side: Literal["bullish", "bearish", "neutral"] = Field(alias="dominantSide")
    invalidation_hint: str = Field(alias="invalidationHint")
    dominant_reasons: List[str] = Field(alias="dominantReasons")


class PressureOutput(AliasModel):
    buy_pressure_integral: int = Field(alias="buyPressureIntegral")
    sell_pressure_integral: int = Field(alias="sellPressureIntegral")
    momentum_velocity: int = Field(alias="momentumVelocity")
    momentum_acceleration: int = Field(alias="momentumAcceleration")
    volatility_pressure: int = Field(alias="volatilityPressure")


class NeuralScoresOutput(AliasModel):
    bullish_pressure: int = Field(alias="bullishPressure")
    bearish_pressure: int = Field(alias="bearishPressure")
    trap_probability: int = Field(alias="trapProbability")
    risk_score: int = Field(alias="riskScore")
    liquidity_dominance: int = Field(alias="liquidityDominance")
    market_strength: int = Field(alias="marketStrength")


class MarketMakingOutput(AliasModel):
    reservation_price: float = Field(alias="reservationPrice")
    total_spread: float = Field(alias="totalSpread")
    bid_price: float = Field(alias="bidPrice")
    ask_price: float = Field(alias="askPrice")
    liquidity_risk: int = Field(alias="liquidityRisk")


class ScenarioOutput(AliasModel):
    name: str
    probability: int


class AnalysisOutput(AliasModel):
    symbol: str
    decision: DecisionOutput
    pressure: PressureOutput
    neural_scores: NeuralScoresOutput = Field(alias="neuralScores")
    market_making: MarketMakingOutput = Field(alias="marketMaking")
    scenarios: List[ScenarioOutput]
