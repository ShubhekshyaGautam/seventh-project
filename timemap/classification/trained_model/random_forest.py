"""
model/random_forest.py

A Random Forest classifier built from scratch (no sklearn), following
Breiman's original algorithm:

  1. Bootstrap sampling: each tree is trained on a random sample of the
     training rows, drawn WITH replacement (so some rows appear multiple
     times, others not at all, for each tree).
  2. Feature randomness: at every split within every tree, only a random
     subset of features is considered (handled inside DecisionTreeClassifier
     via the max_features parameter).
  3. Aggregation: the forest's final prediction is the majority vote
     (for predict) or averaged class probabilities (for predict_proba)
     across all trees.

This mirrors the public interface of sklearn's RandomForestClassifier
(fit / predict / predict_proba) so it can be swapped in with minimal
changes to the rest of the TimeMap backend.
"""

import numpy as np
from collections import Counter
from decision_tree import DecisionTreeClassifier


class RandomForestClassifier:
    """
    Parameters
    ----------
    n_estimators : int
        Number of trees in the forest.
    max_depth : int
        Max depth for each individual tree.
    min_samples_split : int
        Minimum samples required to split a node, per tree.
    max_features : str or int
        Number of features considered at each split.
        'sqrt' -> sqrt(n_features), rounded down (the standard RF default
        for classification tasks).
    bootstrap : bool
        Whether to train each tree on a bootstrap sample of the data.
        True = a real Random Forest. False = just a random subspace
        ensemble (kept as an option for comparison/ablation in your report).
    random_state : int or None
        Seed for reproducibility.
    """

    def __init__(self, n_estimators=100, max_depth=10, min_samples_split=2,
                 max_features="sqrt", bootstrap=True, random_state=None):
        self.n_estimators = n_estimators
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.max_features = max_features
        self.bootstrap = bootstrap
        self.random_state = random_state
        self.trees_ = []
        self.classes_ = None

    def _resolve_max_features(self, n_features):
        if self.max_features == "sqrt":
            return max(1, int(np.sqrt(n_features)))
        elif self.max_features == "log2":
            return max(1, int(np.log2(n_features)))
        elif isinstance(self.max_features, int):
            return min(self.max_features, n_features)
        else:
            return n_features  # None / unrecognized -> use all features

    def fit(self, X, y):
        X = np.asarray(X)
        y = np.asarray(y)
        n_samples, n_features = X.shape
        self.classes_ = np.unique(y)
        max_features = self._resolve_max_features(n_features)

        rng = np.random.RandomState(self.random_state)
        self.trees_ = []

        for i in range(self.n_estimators):
            # Each tree gets its own random generator, seeded off the forest's
            # seed, so results are reproducible but each tree sees different
            # bootstrap samples / feature subsets.
            tree_rng = np.random.RandomState(rng.randint(0, 1_000_000))

            if self.bootstrap:
                sample_indices = tree_rng.choice(
                    n_samples, size=n_samples, replace=True
                )
                X_sample, y_sample = X[sample_indices], y[sample_indices]
            else:
                X_sample, y_sample = X, y

            tree = DecisionTreeClassifier(
                max_depth=self.max_depth,
                min_samples_split=self.min_samples_split,
                max_features=max_features,
                random_state=tree_rng,
            )
            tree.fit(X_sample, y_sample)
            self.trees_.append(tree)

        return self

    def predict_proba(self, X):
        """
        Average the class-probability dict from every tree, per row.
        Returns an (n_samples, n_classes) array in the order of self.classes_.
        """
        X = np.asarray(X)
        all_tree_probas = [tree.predict_proba(X) for tree in self.trees_]  # list[tree][row] -> dict

        n_samples = X.shape[0]
        n_classes = len(self.classes_)
        avg_probas = np.zeros((n_samples, n_classes))

        for tree_probas in all_tree_probas:
            for row_idx, proba_dict in enumerate(tree_probas):
                for class_idx, cls in enumerate(self.classes_):
                    avg_probas[row_idx, class_idx] += proba_dict.get(cls, 0.0)

        avg_probas /= self.n_estimators
        return avg_probas

    def predict(self, X):
        """
        Majority vote across all trees (mode of each tree's hard prediction).
        This is the classic Random Forest voting scheme.
        """
        X = np.asarray(X)
        tree_predictions = np.array([tree.predict(X) for tree in self.trees_])  # (n_trees, n_samples)

        final_predictions = []
        for col in tree_predictions.T:  # iterate over samples
            vote_counts = Counter(col)
            final_predictions.append(vote_counts.most_common(1)[0][0])

        return np.array(final_predictions)

    def score(self, X, y):
        """Accuracy: fraction of correct predictions."""
        y = np.asarray(y)
        preds = self.predict(X)
        return np.mean(preds == y)

    @property
    def feature_importances_(self):
        """
        Rough feature importance: how often each feature was used to split,
        weighted by how many samples passed through that split. This is a
        simplified version of sklearn's impurity-based importance, useful
        for a comparison chart in your report.
        """
        importance_counts = {}

        def walk(node, n_samples_at_node):
            if node.is_leaf():
                return
            importance_counts[node.feature_index] = (
                importance_counts.get(node.feature_index, 0) + n_samples_at_node
            )
            walk(node.left, n_samples_at_node)
            walk(node.right, n_samples_at_node)

        for tree in self.trees_:
            walk(tree.root, 1)

        total = sum(importance_counts.values()) or 1
        n_features = max(importance_counts.keys(), default=-1) + 1
        importances = np.zeros(n_features)
        for idx, count in importance_counts.items():
            importances[idx] = count / total
        return importances
