"""
train_custom_model.py

Trains the from-scratch RandomForestClassifier (see model/random_forest.py)
on TimeMap's preprocessed data (data/processed/train.csv, test.csv — the
files produced by preprocessing/preprocess.py) and evaluates accuracy on
the held-out test set, for comparison against the earlier sklearn result
(93.8% in UT09).

Run this from the same directory as preprocess.py was run from, or adjust
the paths below to match your project structure.
"""

import pandas as pd
import numpy as np
import joblib
import time

from random_forest import RandomForestClassifier

TRAIN_PATH = "../data/processed/train.csv"
TEST_PATH = "../data/processed/test.csv"
MODEL_OUT_PATH = "../trained_model/custom_rf_model.pkl"

FEATURES = [
    "estimated_study_hours",
    "hours_left_until_deadline",
    "completion_percentage",
    "difficulty",
]
TARGET = "risk_level_encoded"


def load_split(path):
    df = pd.read_csv(path)
    X = df[FEATURES].values
    y = df[TARGET].values
    return X, y


def main():
    print("Loading preprocessed train/test data...")
    X_train, y_train = load_split(TRAIN_PATH)
    X_test, y_test = load_split(TEST_PATH)
    print(f"Train: {X_train.shape[0]} rows, Test: {X_test.shape[0]} rows")

    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        min_samples_split=5,
        max_features="sqrt",
        bootstrap=True,
        random_state=42,
    )

    print("Training custom Random Forest (this may take a moment)...")
    start = time.time()
    model.fit(X_train, y_train)
    elapsed = time.time() - start
    print(f"Training completed in {elapsed:.2f} seconds")

    train_accuracy = model.score(X_train, y_train)
    test_accuracy = model.score(X_test, y_test)

    print(f"\nTrain accuracy: {train_accuracy * 100:.2f}%")
    print(f"Test accuracy:  {test_accuracy * 100:.2f}%")
    print(f"(Compare against your earlier sklearn result: 93.8% on 1000 held-out records)")

    print("\nFeature importances (higher = more influential in splits):")
    importances = model.feature_importances_
    for name, imp in zip(FEATURES, importances):
        print(f"  {name}: {imp:.3f}")

    joblib.dump(model, MODEL_OUT_PATH)
    print(f"\nSaved trained custom model to {MODEL_OUT_PATH}")


if __name__ == "__main__":
    main()
