from __future__ import annotations

from typing import Iterable, List

import numpy as np


def _to_array(values: Iterable[float]) -> np.ndarray:
    return np.asarray(list(values), dtype=float)


def _trapezoid_integral(arr: np.ndarray, dt: float) -> float:
    if hasattr(np, "trapezoid"):
        return float(np.trapezoid(arr, dx=dt))

    total = 0.0
    for left, right in zip(arr[:-1], arr[1:]):
        total += (float(left) + float(right)) * 0.5 * dt
    return total


def discrete_integral(values: Iterable[float], dt: float = 1.0) -> float:
    arr = _to_array(values)
    if arr.size == 0:
        return 0.0
    if arr.size == 1:
        return float(arr[0] * dt)
    return _trapezoid_integral(arr, dt)


def discrete_derivative(values: Iterable[float], dt: float = 1.0) -> List[float]:
    arr = _to_array(values)
    if arr.size < 2:
        return [0.0]
    safe_dt = dt if dt != 0 else 1.0
    derivative = np.gradient(arr, safe_dt)
    return [float(item) for item in derivative]


def pressure_integral(values: Iterable[float]) -> float:
    arr = _to_array(values)
    if arr.size == 0:
        return 0.0
    return max(0.0, discrete_integral(arr, dt=1.0))


def momentum_velocity(values: Iterable[float]) -> float:
    derivative = discrete_derivative(values, dt=1.0)
    if not derivative:
        return 0.0
    return float(derivative[-1])


def momentum_acceleration(values: Iterable[float]) -> float:
    velocity_curve = discrete_derivative(values, dt=1.0)
    if len(velocity_curve) < 2:
        return 0.0
    acceleration_curve = discrete_derivative(velocity_curve, dt=1.0)
    return float(acceleration_curve[-1])


def volatility_pressure(values: Iterable[float]) -> float:
    arr = _to_array(values)
    if arr.size < 2:
        return 0.0
    previous = arr[:-1]
    current = arr[1:]
    returns = np.divide(current - previous, previous, out=np.zeros_like(current), where=previous != 0)
    return float(np.std(returns) * 100.0)
