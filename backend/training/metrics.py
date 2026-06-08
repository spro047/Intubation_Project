import numpy as np
from sklearn.metrics import roc_auc_score, confusion_matrix, f1_score


def compute_metrics(labels: np.ndarray, preds: np.ndarray, probs: np.ndarray, num_classes: int = 3):
    cm = confusion_matrix(labels, preds)
    sensitivities = []
    specificities = []
    for i in range(num_classes):
        tp = cm[i, i]
        fn = cm[i, :].sum() - tp
        fp = cm[:, i].sum() - tp
        tn = cm.sum() - (tp + fn + fp)
        sensitivities.append(tp / (tp + fn) if (tp + fn) > 0 else 0.0)
        specificities.append(tn / (tn + fp) if (tn + fp) > 0 else 0.0)

    try:
        if num_classes == 2:
            auc = roc_auc_score(labels, probs[:, 1])
        else:
            auc = roc_auc_score(labels, probs, multi_class="ovr")
    except Exception:
        auc = 0.0

    f1 = f1_score(labels, preds, average="weighted")

    return {
        "accuracy": (preds == labels).mean(),
        "auc_roc": auc,
        "f1_weighted": f1,
        "sensitivity_per_class": sensitivities,
        "specificity_per_class": specificities,
        "confusion_matrix": cm.tolist(),
    }
