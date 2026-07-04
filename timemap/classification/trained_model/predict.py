"""
trained_model/predict.py

Loads the saved model + label encoder once, and exposes a single
predict_risk() function. Import this directly into timemap-backend/app.py
to serve predictions from your Flask API.

Example usage inside app.py:

    from predict import predict_risk

    @app.route("/api/predict", methods=["POST"])
    def predict():
        payload = request.get_json()
        result = predict_risk(
            estimated_study_hours=payload["estimated_study_hours"],
            hours_left_until_deadline=payload["hours_left_until_deadline"],
            completion_percentage=payload["completion_percentage"],
            difficulty=payload["difficulty"],   # "Easy" / "Medium" / "Hard"
        )
        return jsonify(result)
"""

import joblib
import pandas as pd
import os

_THIS_DIR = os.path.dirname(os.path.abspath(__file__))

DIFFICULTY_MAP = {"Easy": 0, "Medium": 1, "Hard": 2}

FEATURES = [
    "estimated_study_hours",
    "hours_left_until_deadline",
    "completion_percentage",
    "difficulty",
]

# Loaded once at import time, not on every request
_model = joblib.load(os.path.join(_THIS_DIR, "risk_classifier.pkl"))
_label_encoder = joblib.load(os.path.join(_THIS_DIR, "label_encoder.pkl"))


def predict_risk(estimated_study_hours: float,
                  hours_left_until_deadline: float,
                  completion_percentage: float,
                  difficulty: str) -> dict:
    """
    Returns:
        {
            "risk_level": "High",
            "confidence": 0.82,
            "probabilities": {"Low": 0.05, "Medium": 0.13, "High": 0.82}
        }
    """
    if difficulty not in DIFFICULTY_MAP:
        raise ValueError(f"difficulty must be one of {list(DIFFICULTY_MAP)}, got '{difficulty}'")

    row = pd.DataFrame([{
        "estimated_study_hours": estimated_study_hours,
        "hours_left_until_deadline": hours_left_until_deadline,
        "completion_percentage": completion_percentage,
        "difficulty": DIFFICULTY_MAP[difficulty],
    }])[FEATURES]

    pred_encoded = _model.predict(row)[0]
    probabilities = _model.predict_proba(row)[0]

    class_names = _label_encoder.classes_
    risk_level = _label_encoder.inverse_transform([pred_encoded])[0]
    confidence = float(max(probabilities))
    prob_map = {cls: float(p) for cls, p in zip(class_names, probabilities)}

    return {
        "risk_level": risk_level,
        "confidence": round(confidence, 4),
        "probabilities": prob_map,
    }


if __name__ == "__main__":
    # Quick manual test
    result = predict_risk(
        estimated_study_hours=3.0,
        hours_left_until_deadline=5.0,
        completion_percentage=20.0,
        difficulty="Hard",
    )
    print(result)