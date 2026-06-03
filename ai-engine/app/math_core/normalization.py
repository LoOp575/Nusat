from __future__ import annotations

import math
from typing import Iterable

import numpy as np


def clamp(value: float, minimum: float = 0.0, maximum: float = 100.0) -> float:
    return max(minimum, min(maximum, float(value)))


def clamp_0_100(value: float) -> float:
    return clamp(value, 0.0, 100.0)


def round_score(value: float) -> int:
    return int(round(clamp_0_100(value)))


def safe_divide(numerator: float, denominator: float, fallback: float = 0.0) -> float:
    if denominator == 0 or not math.isfinite(denominator):
        return fallback
    return numerator / denominator


def normalize_ratio(value: float, low: float, high: float) -> float:
    if high == low:
        return 0.0
    return clamp((value - low) / (high - low), 0.0, 1.0)


def normalize_signed(value: float, scale: float = 1.0) -> float:
    if scale <= 0:
        return 0.5
    return clamp((value / scale + 1.0) / 2.0, 0.0, 1.0)


def log_scale_0_100(value: float, scale: float) -> float:
    safe_value = max(0.0, float(value))
    safe_scale = max(1e-9, float(scale))
    return clamp_0_100(100.0 * math.log1p(safe_value) / math.log1p(safe_scale))


def percentage_share(part: float, total: float) -> float:
    return clamp_0_100(100.0 * safe_divide(part, total, 0.0))


def mean_or_zero(values: Iterable[float]) -> float:
    arr = np.asarray(list(values), dtype=float)
    if arr.size == 0:
        return 0.0
    return float(np.mean(arr))
