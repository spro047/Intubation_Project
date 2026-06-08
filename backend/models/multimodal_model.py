import torch
import torch.nn as nn
from typing import Dict, Optional, List
from .tab_encoder import TabEncoder
from .image_encoder import ImageEncoder
from .fusion import CrossAttentionFusion


class MultimodalAirwayModel(nn.Module):
    def __init__(
        self,
        num_numerical: int,
        cat_cardinalities: List[int],
        num_classes: int = 3,
        tab_embed_dim: int = 64,
        tab_output_dim: int = 128,
        img_output_dim: int = 128,
        fusion_embed_dim: int = 256,
        num_heads: int = 4,
        dropout: float = 0.3,
    ):
        super().__init__()
        self.tab_encoder = TabEncoder(
            num_numerical=num_numerical,
            cat_cardinalities=cat_cardinalities,
            embed_dim=tab_embed_dim,
            output_dim=tab_output_dim,
            dropout=dropout,
        )
        self.image_encoder = ImageEncoder(
            output_dim=img_output_dim,
            dropout=dropout,
        )
        self.fusion = CrossAttentionFusion(
            tab_dim=tab_output_dim,
            img_dim=img_output_dim,
            embed_dim=fusion_embed_dim,
            num_heads=num_heads,
            dropout=dropout,
        )
        self.classifier = nn.Sequential(
            nn.Linear(tab_output_dim, 128),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(128, num_classes),
        )

    def forward(
        self,
        numerical: torch.Tensor,
        categorical_indices: List[torch.Tensor],
        images: Dict[str, Optional[torch.Tensor]],
    ) -> torch.Tensor:
        tab_out = self.tab_encoder(numerical, categorical_indices)
        img_out = self.image_encoder(images)
        fused = self.fusion(tab_out, img_out)
        logits = self.classifier(fused)
        return logits
