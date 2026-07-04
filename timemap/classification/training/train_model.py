"""
training/train_model.py

Trains a RandomForestClassifier on the processed train.csv,
does a light hyperparameter search, and saves the final model.
"""

import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import GridSearchCV
import joblib
import os

PROCESSED_DIR = "../data/processed"
MODEL_DIR = "../trained_model"
os.makedirs(MODEL_DIR, exist_ok=True)

FEATURES = [
    "estimated_study_hours",
    "hours_left_until_deadline",
    "completion_percentage",
    "difficulty",
]
TARGET = "risk_level_encoded"


def load_train_data():
    df = pd.read_csv(f"{PROCESSED_DIR}/train.csv")
    X = df[FEATURES]
    y = df[TARGET]
    return X, y


def train(X, y):
    # class_weight='balanced' matters here in case one risk level
    # (e.g. "Medium") dominates the dataset — without it the model
    # can get lazy and just predict the majority class often.
    base_model = RandomForestClassifier(
        random_state=42,
        class_weight="balanced",
        n_jobs=-1,
    )

    # Small grid — expand this once you've confirmed the pipeline works end to end
    param_grid = {
        "n_estimators": [100, 200, 300],
        "max_depth": [None, 6, 10, 14],
        "min_samples_leaf": [1, 2, 4],
    }

    search = GridSearchCV(
        base_model,
        param_grid,
        cv=5,
        scoring="f1_macro",  # macro-F1 treats all 3 classes equally, not just majority accuracy
        n_jobs=-1,
        verbose=1,
    )
    search.fit(X, y)

    print("Best params:", search.best_params_)
    print("Best CV macro-F1:", search.best_score_)

    return search.best_estimator_


def main():
    X, y = load_train_data()
    model = train(X, y)

    joblib.dump(model, f"{MODEL_DIR}/risk_classifier.pkl")
    print(f"Saved trained model to {MODEL_DIR}/risk_classifier.pkl")


if __name__ == "__main__":
    main()