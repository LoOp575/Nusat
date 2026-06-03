from __future__ import annotations

import math
from typing import Iterable


def sigmoid(z: float) -> float:
    if z >= 0:
        ez = math.exp(-z)
        return 1.0 / (1.0 + ez)
    ez = math.exp(z)
    return ez / (1.0 + ez)


def weighted_sum(inputs: Iterable[float], weights: Iterable[float], bias: float = 0.0) -> float:
    return float(sum(input_value * weight for input_value, weight in zip(inputs, weights)) + bias)


def neural_score(inputs: Iterable[float], weights: Iterable[float], bias: float = 0.0) -> float:
    z = weighted_sum(inputs, weights, bias)
    return sigmoid(z) * 100.0
