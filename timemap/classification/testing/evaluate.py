"""
testing/evaluate_model.py

Loads the held-out test set and the trained model, then reports
classification metrics, a confusion matrix, and feature importance.
"""

import pandas as pd
import joblib
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns

PROCESSED_DIR = "../data/processed"
MODEL_DIR = "../trained_model"

FEATURES = [
    "estimated_study_hours",
    "hours_left_until_deadline",
    "completion_percentage",
    "difficulty",
]
TARGET = "risk_level_encoded"


def main():
    # Load test data, model, and the label encoder saved during preprocessing
    test_df = pd.read_csv(f"{PROCESSED_DIR}/test.csv")
    model = joblib.load(f"{MODEL_DIR}/risk_classifier.pkl")
    label_encoder = joblib.load(f"{MODEL_DIR}/label_encoder.pkl")

    X_test = test_df[FEATURES]
    y_test = test_df[TARGET]

    y_pred = model.predict(X_test)

    class_names = label_encoder.classes_  # e.g. ["High", "Low", "Medium"] in encoded order

    print("=== Classification Report ===")
    print(classification_report(y_test, y_pred, target_names=class_names))

    # Confusion matrix
    cm = confusion_matrix(y_test, y_pred)
    plt.figure(figsize=(6, 5))
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues",
                xticklabels=class_names, yticklabels=class_names)
    plt.xlabel("Predicted")
    plt.ylabel("Actual")
    plt.title("Confusion Matrix — Risk Level")
    plt.tight_layout()
    plt.savefig(f"{MODEL_DIR}/confusion_matrix.png")
    print(f"Saved confusion matrix plot to {MODEL_DIR}/confusion_matrix.png")

    # Feature importance — tells you which of the 4 inputs actually
    # drives the model's decisions
    importances = pd.Series(model.feature_importances_, index=FEATURES)
    importances = importances.sort_values(ascending=False)

    print("\n=== Feature Importance ===")
    print(importances)

    plt.figure(figsize=(6, 4))
    importances.plot(kind="barh")
    plt.xlabel("Importance")
    plt.title("Feature Importance — Risk Classifier")
    plt.gca().invert_yaxis()
    plt.tight_layout()
    plt.savefig(f"{MODEL_DIR}/feature_importance.png")
    print(f"Saved feature importance plot to {MODEL_DIR}/feature_importance.png")


if __name__ == "__main__":
    main()
