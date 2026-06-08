import pandas as pd
import torch
from torch.utils.data import Dataset
from pathlib import Path
from PIL import Image
from typing import Dict, Optional, Tuple
from .transforms import get_train_transforms, get_val_transforms


class AirwayDataset(Dataset):
    MODALITIES = ["face", "side_profile", "neck", "ultrasound", "ct_mri"]
    MODALITY_EXTENSIONS = {
        "face": [".jpg", ".jpeg", ".png"],
        "side_profile": [".jpg", ".jpeg", ".png"],
        "neck": [".jpg", ".jpeg", ".png"],
        "ultrasound": [".png", ".jpg"],
        "ct_mri": [".dcm", ".jpg", ".png"],
    }

    def __init__(
        self,
        xlsx_path: str,
        image_root: str,
        scaler=None,
        label_encoders=None,
        transform="val",
        target_col: Optional[str] = "Target",
    ):
        self.df = pd.read_excel(xlsx_path)
        self.image_root = Path(image_root)
        self.scaler = scaler
        self.label_encoders = label_encoders
        self.target_col = target_col
        self.transform = (
            get_train_transforms() if transform == "train" else get_val_transforms()
        )

    def __len__(self) -> int:
        return len(self.df)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, Dict[str, torch.Tensor], Optional[torch.Tensor]]:
        row = self.df.iloc[idx]
        patient_id = str(row.get("Patient_ID", idx))

        tabular = self._get_tabular(row)
        images = self._load_images(patient_id)

        if self.target_col and self.target_col in self.df.columns:
            label = torch.tensor(int(row[self.target_col]), dtype=torch.long)
        else:
            label = None

        return tabular, images, label

    def _get_tabular(self, row) -> torch.Tensor:
        vals = []
        for col in self.df.columns:
            if col in ("Patient_ID", self.target_col):
                continue
            v = row[col]
            if pd.isna(v):
                v = 0.0
            vals.append(float(v))
        return torch.tensor(vals, dtype=torch.float32)

    def _load_images(self, patient_id: str) -> Dict[str, Optional[torch.Tensor]]:
        patient_dir = self.image_root / patient_id
        result = {}
        for mod in self.MODALITIES:
            img_tensor = self._load_single_image(patient_dir, mod)
            result[mod] = img_tensor
        return result

    def _load_single_image(self, patient_dir: Path, modality: str) -> Optional[torch.Tensor]:
        if not patient_dir.exists():
            return None
        exts = self.MODALITY_EXTENSIONS[modality]
        for ext in exts:
            candidates = list(patient_dir.glob(f"*{ext}"))
            if candidates:
                try:
                    img = Image.open(candidates[0]).convert("RGB")
                    return self.transform(img)
                except Exception:
                    return None
        return None
