#!/usr/bin/env python3
"""Unit tests for the archived protocol and derived counts."""

import csv
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROTOCOL_PATH = ROOT / "data" / "raw" / "experiment_protocol.json"


class TestObservations(unittest.TestCase):
    @staticmethod
    def load_observations():
        return json.loads(PROTOCOL_PATH.read_text())["observations"]

    def test_recording_and_sampling_durations(self):
        observations = self.load_observations()
        self.assertEqual(len(observations), 36)

        for observation in observations:
            self.assertIn(observation["A_start_offset_seconds"], [0, 60, 120, 180, 240])
            self.assertEqual(len(observation["B_start_offsets_seconds"]), 6)

            for index, offset in enumerate(observation["B_start_offsets_seconds"]):
                self.assertIn(offset, [50 * index + 10 * j for j in range(5)])

    def test_method_b_uses_one_sample_per_50_second_stratum(self):
        observations = self.load_observations()

        for observation in observations:
            offsets = [int(value) for value in observation["B_start_offsets_seconds"]]
            self.assertEqual(sorted(offset // 50 for offset in offsets), [0, 1, 2, 3, 4, 5])

            for offset in offsets:
                self.assertGreaterEqual(offset, 0)
                self.assertLess(offset, 300)

    def test_processed_counts(self):
        with (ROOT / "data" / "processed" / "analysis_dataset.csv").open() as handle:
            rows = list(csv.DictReader(handle))

        self.assertEqual(len(rows), 36)
        self.assertEqual(sum(int(row["full_count"]) for row in rows), 828)
        self.assertEqual(sum(int(row["A_count"]) for row in rows), 159)
        self.assertEqual(sum(int(row["B_count"]) for row in rows), 144)

        for row in rows:
            full = int(row["full_count"])
            method_a = int(row["A_count"])
            method_b = int(row["B_count"])
            self.assertEqual(int(row["A_error_absolute"]), abs(5 * method_a - full))
            self.assertEqual(int(row["B_error_absolute"]), abs(5 * method_b - full))


if __name__ == "__main__":
    unittest.main()
