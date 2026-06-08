import torch
import torch.nn as nn


class FocalLoss(nn.Module):
    def __init__(self, alpha=None, gamma: float = 2.0, reduction: str = "mean"):
        super().__init__()
        self.alpha = alpha
        self.gamma = gamma
        self.reduction = reduction

    def forward(self, logits: torch.Tensor, targets: torch.Tensor) -> torch.Tensor:
        ce_loss = nn.functional.cross_entropy(logits, targets, reduction="none", weight=self.alpha)
        pt = torch.exp(-ce_loss)
        focal_loss = ((1 - pt) ** self.gamma) * ce_loss
        if self.reduction == "mean":
            return focal_loss.mean()
        elif self.reduction == "sum":
            return focal_loss.sum()
        return focal_loss


class ContrastiveAlignmentLoss(nn.Module):
    def __init__(self, temperature: float = 0.07):
        super().__init__()
        self.temperature = temperature

    def forward(self, tab_emb: torch.Tensor, img_embs: torch.Tensor) -> torch.Tensor:
        tab_norm = nn.functional.normalize(tab_emb, dim=-1)
        img_norm = nn.functional.normalize(img_embs, dim=-1)
        logits = (tab_norm @ img_norm.T) / self.temperature
        labels = torch.arange(len(tab_norm), device=tab_norm.device)
        loss = nn.functional.cross_entropy(logits, labels)
        return loss
