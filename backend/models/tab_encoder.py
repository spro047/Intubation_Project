import torch
import torch.nn as nn
import math


class TabularEmbedding(nn.Module):
    def __init__(self, num_numerical: int, cat_cardinalities: list, embed_dim: int = 64):
        super().__init__()
        self.num_numerical = num_numerical
        self.numerical_proj = nn.Linear(num_numerical, embed_dim)
        self.categorical_embeddings = nn.ModuleList([
            nn.Embedding(card, embed_dim) for card in cat_cardinalities
        ])
        self.pos_encoding = nn.Parameter(torch.randn(1, 1 + len(cat_cardinalities), embed_dim))

    def forward(self, numerical, categorical_indices):
        x_num = self.numerical_proj(numerical).unsqueeze(1)
        x_cat = [emb(cat_indices.clamp(0, emb.num_embeddings - 1)).unsqueeze(1)
                 for emb, cat_indices in zip(self.categorical_embeddings, categorical_indices)]
        x = torch.cat([x_num] + x_cat, dim=1)
        x = x + self.pos_encoding[:, :x.size(1)]
        return x


class TabTransformerBlock(nn.Module):
    def __init__(self, embed_dim: int = 64, num_heads: int = 4, ff_dim: int = 256, dropout: float = 0.1):
        super().__init__()
        self.attention = nn.MultiheadAttention(embed_dim, num_heads, dropout=dropout, batch_first=True)
        self.norm1 = nn.LayerNorm(embed_dim)
        self.norm2 = nn.LayerNorm(embed_dim)
        self.ff = nn.Sequential(
            nn.Linear(embed_dim, ff_dim),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(ff_dim, embed_dim),
            nn.Dropout(dropout),
        )

    def forward(self, x):
        attn_out, _ = self.attention(x, x, x)
        x = self.norm1(x + attn_out)
        ff_out = self.ff(x)
        x = self.norm2(x + ff_out)
        return x


class TabEncoder(nn.Module):
    def __init__(
        self,
        num_numerical: int,
        cat_cardinalities: list,
        embed_dim: int = 64,
        num_layers: int = 3,
        num_heads: int = 4,
        output_dim: int = 128,
        dropout: float = 0.1,
    ):
        super().__init__()
        self.embedding = TabularEmbedding(num_numerical, cat_cardinalities, embed_dim)
        self.transformer_blocks = nn.Sequential(*[
            TabTransformerBlock(embed_dim, num_heads, embed_dim * 4, dropout)
            for _ in range(num_layers)
        ])
        self.output_proj = nn.Linear(embed_dim, output_dim)

    def forward(self, numerical, categorical_indices):
        x = self.embedding(numerical, categorical_indices)
        x = self.transformer_blocks(x)
        x = x.mean(dim=1)
        x = self.output_proj(x)
        return x
