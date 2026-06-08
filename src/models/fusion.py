import torch
import torch.nn as nn
from typing import Dict, List, Optional


class CrossAttentionFusion(nn.Module):
    def __init__(
        self,
        tab_dim: int = 128,
        img_dim: int = 128,
        embed_dim: int = 256,
        num_heads: int = 4,
        dropout: float = 0.1,
    ):
        super().__init__()
        self.tab_proj = nn.Linear(tab_dim, embed_dim)
        self.img_proj = nn.Linear(img_dim, embed_dim)

        self.cross_attn = nn.MultiheadAttention(
            embed_dim, num_heads, dropout=dropout, batch_first=True
        )
        self.self_attn = nn.MultiheadAttention(
            embed_dim, num_heads, dropout=dropout, batch_first=True
        )
        self.norm = nn.LayerNorm(embed_dim)
        self.ff = nn.Sequential(
            nn.Linear(embed_dim, embed_dim * 2),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(embed_dim * 2, embed_dim),
            nn.Dropout(dropout),
        )
        self.output_proj = nn.Linear(embed_dim, tab_dim)

    def forward(
        self, tab_emb: torch.Tensor, img_embs: Dict[str, Optional[torch.Tensor]]
    ) -> torch.Tensor:
        tab_projected = self.tab_proj(tab_emb)
        tab_q = tab_projected.unsqueeze(1)

        valid_img_embs = [v for v in img_embs.values() if v is not None]
        if not valid_img_embs:
            return self.output_proj(tab_projected)

        img_stack = torch.stack([self.img_proj(v) for v in valid_img_embs], dim=1)

        attended, _ = self.cross_attn(query=tab_q, key=img_stack, value=img_stack)
        attended = attended.squeeze(1)

        fused = self.norm(tab_projected + attended)
        ff_out = self.ff(fused.unsqueeze(1)).squeeze(1)
        fused = self.norm(fused + ff_out)

        return self.output_proj(fused)
