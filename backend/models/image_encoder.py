import torch
import torch.nn as nn
import timm
from typing import Dict, Optional


class ImageEncoder(nn.Module):
    MODALITIES = ["face", "side_profile", "neck", "ultrasound", "ct_mri"]

    def __init__(
        self,
        model_name: str = "resnet50",
        pretrained: bool = True,
        output_dim: int = 128,
        shared_backbone: bool = True,
        dropout: float = 0.1,
    ):
        super().__init__()
        self.shared_backbone = shared_backbone

        if shared_backbone:
            backbone = timm.create_model(model_name, pretrained=pretrained, num_classes=0)
            self.backbone = backbone
            backbone_dim = backbone.num_features
            self.per_modality_proj = nn.ModuleDict({
                mod: nn.Sequential(
                    nn.Linear(backbone_dim, output_dim),
                    nn.LayerNorm(output_dim),
                    nn.GELU(),
                    nn.Dropout(dropout),
                )
                for mod in self.MODALITIES
            })
        else:
            self.backbone = nn.ModuleDict({
                mod: timm.create_model(model_name, pretrained=pretrained, num_classes=0)
                for mod in self.MODALITIES
            })
            backbone_dim = list(self.backbone.values())[0].num_features
            self.proj = nn.Linear(backbone_dim, output_dim)

        self.output_dim = output_dim

    def forward(self, images: Dict[str, Optional[torch.Tensor]]) -> Dict[str, Optional[torch.Tensor]]:
        outputs = {}
        for mod in self.MODALITIES:
            img = images.get(mod)
            if img is None:
                outputs[mod] = None
                continue

            if self.shared_backbone:
                features = self.backbone(img)
                outputs[mod] = self.per_modality_proj[mod](features)
            else:
                features = self.backbone[mod](img)
                outputs[mod] = self.proj(features)

        return outputs
