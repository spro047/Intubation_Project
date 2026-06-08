import torch
import numpy as np
from captum.attr import IntegratedGradients
from typing import List


def explain_tabular_shap(
    model: torch.nn.Module,
    numerical: torch.Tensor,
    categorical_indices: List[torch.Tensor],
    images,
    target_class: int,
    baselines: int = 50,
    device: str = "cuda",
):
    model.eval()
    numerical = numerical.to(device).unsqueeze(0)
    categorical_indices = [c.to(device).unsqueeze(0) for c in categorical_indices]

    ig = IntegratedGradients(
        lambda x: model(x, categorical_indices, images)[:, target_class]
    )
    baseline_num = torch.zeros_like(numerical)
    attributions, _ = ig.attribute(numerical, baselines=baseline_num, n_steps=baselines, return_convergence_delta=True)
    return attributions.squeeze(0).cpu().detach().numpy()
