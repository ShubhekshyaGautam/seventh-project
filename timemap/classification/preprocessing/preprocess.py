"""
preprocessing/preprocess.py

Loads raw training_data.csv, cleans it, encodes categorical columns,
splits into train/test, and saves everything to data/processed/.

Expected raw columns:
    estimated_study_hours, hours_left_until_deadline,
    completion_percentage, difficulty, risk_level
"""

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import joblib
import os

# ---- Paths (matches: classification/data/training_data.csv) ----
RAW_PATH = "../data/training_data.csv"
PROCESSED_DIR = "../data/processed"
ENCODER_DIR = "../trained_model"

os.makedirs(PROCESSED_DIR, exist_ok=True)
os.makedirs(ENCODER_DIR, exist_ok=True)

FEATURES = [
    "estimated_study_hours",
    "hours_left_until_deadline",
    "completion_percentage",
    "difficulty",
]
TARGET = "risk_level"

# Ordinal mapping — difficulty HAS a natural order, so we encode it manually
# instead of one-hot encoding (which would throw that order away).
DIFFICULTY_MAP = {"Easy": 0, "Medium": 1, "Hard": 2}


def load_data(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    print(f"Loaded {len(df)} rows, {df.shape[1]} columns")
    return df


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    before = len(df)

    # Drop exact duplicates
    df = df.drop_duplicates()

    # Drop rows with missing values in required columns
    df = df.dropna(subset=FEATURES + [TARGET])

    # Basic sanity filters — study hours and hours left shouldn't be negative,
    # completion percentage should be within 0-100
    df = df[df["estimated_study_hours"] >= 0]
    df = df[df["hours_left_until_deadline"] >= 0]
    df = df[(df["completion_percentage"] >= 0) & (df["completion_percentage"] <= 100)]

    after = len(df)
    print(f"Cleaning removed {before - after} rows ({after} remaining)")
    return df


def encode_data(df: pd.DataFrame):
    df = df.copy()

    # Encode difficulty ordinally
    df["difficulty"] = df["difficulty"].map(DIFFICULTY_MAP)
    if df["difficulty"].isna().any():
        bad = df[df["difficulty"].isna()]
        raise ValueError(f"Unrecognized difficulty values found: {bad}")

    # Encode target with LabelEncoder (and SAVE the encoder — you need it
    # later to turn model predictions like `2` back into "High")
    label_encoder = LabelEncoder()
    df["risk_level_encoded"] = label_encoder.fit_transform(df[TARGET])

    print("Target classes:", dict(zip(label_encoder.classes_,
                                       label_encoder.transform(label_encoder.classes_))))

    return df, label_encoder


def split_and_save(df: pd.DataFrame):
    X = df[FEATURES]
    y = df["risk_level_encoded"]

    # stratify=y keeps the Low/Medium/High ratio consistent across
    # train and test — important since risk levels are usually imbalanced
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    X_train.assign(risk_level_encoded=y_train).to_csv(
        f"{PROCESSED_DIR}/train.csv", index=False
    )
    X_test.assign(risk_level_encoded=y_test).to_csv(
        f"{PROCESSED_DIR}/test.csv", index=False
    )

    print(f"Saved train.csv ({len(X_train)} rows) and test.csv ({len(X_test)} rows) "
          f"to {PROCESSED_DIR}")


def main():
    df = load_data(RAW_PATH)
    df = clean_data(df)
    df, label_encoder = encode_data(df)

    # Save the label encoder so training/evaluation scripts can reuse it
    joblib.dump(label_encoder, f"{ENCODER_DIR}/label_encoder.pkl")
    print(f"Saved label encoder to {ENCODER_DIR}/label_encoder.pkl")

    split_and_save(df)


if __name__ == "__main__":
    main()