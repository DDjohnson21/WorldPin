"""Tiny demo of an intentionally random sorting algorithm.

This exposes `random_sort`, which performs a bogosort-style shuffle until the
sequence happens to be ordered. It is useful purely for experimentation and
should not be used for production sorting needs.
"""

from __future__ import annotations

import random
from typing import List, Sequence, TypeVar


T = TypeVar("T")


def is_sorted(values: Sequence[T]) -> bool:
    """Return True when the provided sequence is monotonically non-decreasing."""

    return all(values[idx] <= values[idx + 1] for idx in range(len(values) - 1))


def random_sort(values: Sequence[T], max_attempts: int = 10000) -> List[T]:
    """Sort `values` by repeatedly shuffling until the list is ordered.

    Args:
        values: Any finite sequence of comparable items.
        max_attempts: Upper bound on the number of shuffles; the function raises
            `RuntimeError` once this threshold is exceeded.

    Returns:
        A new list containing the items from `values` arranged in ascending
        order.

    Raises:
        RuntimeError: If the data could not be sorted within `max_attempts`
            shuffles.
    """

    attempt = 0
    candidate = list(values)
    while attempt < max_attempts:
        if is_sorted(candidate):
            return candidate
        random.shuffle(candidate)
        attempt += 1

    raise RuntimeError(
        "Failed to randomly sort values within the allotted shuffle budget."
    )


if __name__ == "__main__":
    SAMPLE = [3, 1, 2]
    try:
        result = random_sort(SAMPLE)
    except RuntimeError as exc:  # pragma: no cover - demonstration only
        print(f"Sorting failed: {exc}")
    else:
        print(f"Sorted output: {result}")
