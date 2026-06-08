import torch
import torchvision.transforms as T
from typing import Dict

IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]


def get_train_transforms(img_size: int = 224) -> T.Compose:
    return T.Compose([
        T.Resize((img_size, img_size)),
        T.RandomHorizontalFlip(p=0.5),
        T.RandomRotation(degrees=10),
        T.ColorJitter(brightness=0.2, contrast=0.2),
        T.RandomAffine(degrees=0, translate=(0.1, 0.1)),
        T.ToTensor(),
        T.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
    ])


def get_val_transforms(img_size: int = 224) -> T.Compose:
    return T.Compose([
        T.Resize((img_size, img_size)),
        T.ToTensor(),
        T.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
    ])


TRANSFORM_REGISTRY: Dict[str, T.Compose] = {
    "face": get_train_transforms,
    "side_profile": get_train_transforms,
    "neck": get_train_transforms,
    "ultrasound": None,
    "ct_mri": None,
}


def get_medical_window_transform(
    window_center: int = 40,
    window_width: int = 400,
    img_size: int = 224,
) -> T.Compose:
    def window_normalize(img):
        import numpy as np
        arr = np.array(img, dtype=np.float32)
        lower = window_center - window_width // 2
        upper = window_center + window_width // 2
        arr = np.clip(arr, lower, upper)
        arr = (arr - lower) / (upper - lower)
        return torch.tensor(arr).unsqueeze(0).repeat(3, 1, 1)

    return T.Compose([
        T.Resize((img_size, img_size)),
        T.ToTensor(),
        window_normalize,
    ])
