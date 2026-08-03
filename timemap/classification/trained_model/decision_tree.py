"""
model/decision_tree.py

A Decision Tree classifier built from scratch (no sklearn), implementing
the CART algorithm with Gini impurity for split selection.

This is the building block used by RandomForest (see random_forest.py).
Each tree is grown independently and, when used inside a forest, only
considers a random subset of features at each split (this is what turns
plain bagged trees into a "random forest").
"""

import numpy as np


class Node:
    """A single node in the tree. Either a decision node (has feature_index,
    threshold, left, right) or a leaf node (has value = class distribution)."""

    def __init__(self, feature_index=None, threshold=None,
                 left=None, right=None, value=None):
        self.feature_index = feature_index
        self.threshold = threshold
        self.left = left
        self.right = right
        self.value = value  # dict: {class_label: probability}, only set on leaves

    def is_leaf(self):
        return self.value is not None


def gini_impurity(y):
    """
    Gini impurity: measures how 'mixed' the classes are in a set of labels.
    0 = perfectly pure (all one class), higher = more mixed.

    Formula: 1 - sum(p_i^2) for each class i, where p_i is the
    proportion of class i in y.
    """
    if len(y) == 0:
        return 0.0
    _, counts = np.unique(y, return_counts=True)
    probabilities = counts / len(y)
    return 1.0 - np.sum(probabilities ** 2)


def weighted_gini(y_left, y_right):
    """Weighted average of Gini impurity across a split's two branches."""
    n = len(y_left) + len(y_right)
    if n == 0:
        return 0.0
    return (len(y_left) / n) * gini_impurity(y_left) + \
           (len(y_right) / n) * gini_impurity(y_right)


class DecisionTreeClassifier:
    """
    A single decision tree, grown greedily by picking the split that
    minimizes weighted Gini impurity at each node.

    Parameters
    ----------
    max_depth : int
        Maximum depth the tree is allowed to grow to.
    min_samples_split : int
        A node must have at least this many samples to be split further.
    max_features : int or None
        If set, only this many randomly chosen features are considered
        at each split (used by RandomForest for feature randomness).
        If None, all features are considered (a plain, non-random tree).
    random_state : np.random.RandomState or None
        Random generator used for feature subsampling, for reproducibility.
    """

    def __init__(self, max_depth=10, min_samples_split=2,
                 max_features=None, random_state=None):
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.max_features = max_features
        self.random_state = random_state or np.random.RandomState()
        self.root = None
        self.n_classes_ = None

    def fit(self, X, y):
        X = np.asarray(X)
        y = np.asarray(y)
        self.n_classes_ = len(np.unique(y))
        self.root = self._grow_tree(X, y, depth=0)
        return self

    def _leaf_value(self, y):
        """Class distribution at a leaf, e.g. {0: 0.1, 1: 0.2, 2: 0.7}."""
        classes, counts = np.unique(y, return_counts=True)
        probs = counts / len(y)
        return dict(zip(classes, probs))

    def _best_split(self, X, y):
        """
        Search for the (feature, threshold) pair that minimizes weighted
        Gini impurity. Only a random subset of features is searched if
        max_features is set (this is the "random" part of Random Forest).
        """
        n_samples, n_features = X.shape
        best_gini = float("inf")
        best_feature, best_threshold = None, None

        if self.max_features is not None and self.max_features < n_features:
            feature_indices = self.random_state.choice(
                n_features, self.max_features, replace=False
            )
        else:
            feature_indices = range(n_features)

        for feature_index in feature_indices:
            values = X[:, feature_index]
            thresholds = np.unique(values)
            # Try midpoints between consecutive unique values as candidate splits
            for i in range(len(thresholds) - 1):
                threshold = (thresholds[i] + thresholds[i + 1]) / 2.0
                left_mask = values <= threshold
                right_mask = ~left_mask

                if left_mask.sum() == 0 or right_mask.sum() == 0:
                    continue

                gini = weighted_gini(y[left_mask], y[right_mask])
                if gini < best_gini:
                    best_gini = gini
                    best_feature = feature_index
                    best_threshold = threshold

        return best_feature, best_threshold, best_gini

    def _grow_tree(self, X, y, depth):
        n_samples = len(y)
        n_unique_classes = len(np.unique(y))

        # Stopping conditions -> make a leaf
        if (depth >= self.max_depth or
                n_samples < self.min_samples_split or
                n_unique_classes == 1):
            return Node(value=self._leaf_value(y))

        feature_index, threshold, gini = self._best_split(X, y)

        if feature_index is None:
            # No split improved things (e.g. all rows identical) -> leaf
            return Node(value=self._leaf_value(y))

        left_mask = X[:, feature_index] <= threshold
        right_mask = ~left_mask

        left_subtree = self._grow_tree(X[left_mask], y[left_mask], depth + 1)
        right_subtree = self._grow_tree(X[right_mask], y[right_mask], depth + 1)

        return Node(feature_index=feature_index, threshold=threshold,
                     left=left_subtree, right=right_subtree)

    def _predict_one_proba(self, x, node):
        if node.is_leaf():
            return node.value
        if x[node.feature_index] <= node.threshold:
            return self._predict_one_proba(x, node.left)
        else:
            return self._predict_one_proba(x, node.right)

    def predict_proba(self, X):
        """Returns list of {class: probability} dicts, one per row."""
        X = np.asarray(X)
        return [self._predict_one_proba(x, self.root) for x in X]

    def predict(self, X):
        """Returns the majority class for each row."""
        probas = self.predict_proba(X)
        return np.array([max(p, key=p.get) for p in probas])
