"""
regenerate_metrics.py

Runs the custom Random Forest model (custom_rf_model.pkl) against the
held-out test set and produces a fresh confusion matrix + per-class
precision/recall/F1 — replacing the old sklearn-based Table 5.3/5.4.

Run this from trained_model/ (or adjust paths below to match your project).
"""

import pandas as pd
import numpy as np
import joblib

TEST_PATH = "../data/processed/test.csv"
MODEL_PATH = "custom_rf_model.pkl"
ENCODER_PATH = "label_encoder.pkl"

FEATURES = [
    "estimated_study_hours",
    "hours_left_until_deadline",
    "completion_percentage",
    "difficulty",
]
TARGET = "risk_level_encoded"


def main():
    df = pd.read_csv(TEST_PATH)
    X_test = df[FEATURES].values
    y_test = df[TARGET].values

    model = joblib.load(MODEL_PATH)
    label_encoder = joblib.load(ENCODER_PATH)
    class_names = label_encoder.classes_  # e.g. ['High', 'Low', 'Medium'] in encoded order

    y_pred = model.predict(X_test)

    # Build confusion matrix manually (rows = actual, cols = predicted)
    n_classes = len(class_names)
    cm = np.zeros((n_classes, n_classes), dtype=int)
    for actual, pred in zip(y_test, y_pred):
        cm[actual][pred] += 1

    print("Confusion Matrix (rows = actual, columns = predicted)")
    print("Classes in order:", list(class_names))
    print(cm)
    print()

    # Per-class precision, recall, F1
    print(f"{'Class':<10}{'TP':>6}{'FP':>6}{'FN':>6}{'TN':>6}{'Precision':>12}{'Recall':>10}{'F1':>8}")
    for i, cls in enumerate(class_names):
        TP = cm[i][i]
        FP = cm[:, i].sum() - TP
        FN = cm[i, :].sum() - TP
        TN = cm.sum() - TP - FP - FN

        precision = TP / (TP + FP) if (TP + FP) > 0 else 0
        recall = TP / (TP + FN) if (TP + FN) > 0 else 0
        f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0

        print(f"{cls:<10}{TP:>6}{FP:>6}{FN:>6}{TN:>6}{precision:>12.2f}{recall:>10.2f}{f1:>8.2f}")

    overall_accuracy = np.trace(cm) / cm.sum()
    print(f"\nOverall Accuracy: {overall_accuracy:.3f} ({overall_accuracy*100:.1f}%)")
    print(f"Total misclassifications: {cm.sum() - np.trace(cm)} out of {cm.sum()}")


if __name__ == "__main__":
    main()
