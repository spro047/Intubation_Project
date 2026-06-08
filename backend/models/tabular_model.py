import torch
import torch.nn as nn
from backend.models.tab_encoder import TabEncoder


class TabularModel(nn.Module):
    def __init__(
        self,
        num_numerical: int,
        cat_cardinalities: list,
        num_classes: int = 3,
        embed_dim: int = 64,
        tab_output_dim: int = 128,
        dropout: float = 0.3,
    ):
        super().__init__()
        self.tab_encoder = TabEncoder(
            num_numerical=num_numerical,
            cat_cardinalities=cat_cardinalities,
            embed_dim=embed_dim,
            output_dim=tab_output_dim,
            dropout=dropout,
        )
        self.classifier = nn.Sequential(
            nn.Linear(tab_output_dim, 128),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(128, num_classes),
        )

    def forward(self, numerical: torch.Tensor, categorical_indices: list) -> torch.Tensor:
        tab_out = self.tab_encoder(numerical, categorical_indices)
        logits = self.classifier(tab_out)
        return logits
