import torch
from torch.utils.data import DataLoader, random_split
from typing import Tuple, Optional
from .dataset import AirwayDataset


def create_loaders(
    xlsx_path: str,
    image_root: str,
    batch_size: int = 16,
    train_ratio: float = 0.8,
    val_ratio: float = 0.1,
    test_ratio: float = 0.1,
    num_workers: int = 0,
    seed: int = 42,
) -> Tuple[DataLoader, DataLoader, DataLoader, AirwayDataset]:
    full_dataset = AirwayDataset(
        xlsx_path=xlsx_path,
        image_root=image_root,
        transform="train",
        target_col="Target",
    )

    val_dataset = AirwayDataset(
        xlsx_path=xlsx_path,
        image_root=image_root,
        transform="val",
        target_col="Target",
    )

    test_dataset = AirwayDataset(
        xlsx_path=xlsx_path,
        image_root=image_root,
        transform="val",
        target_col="Target",
    )

    n = len(full_dataset)
    train_len = int(n * train_ratio)
    val_len = int(n * val_ratio)
    test_len = n - train_len - val_len

    generator = torch.Generator().manual_seed(seed)
    train_idx, val_idx, test_idx = random_split(
        range(n), [train_len, val_len, test_len], generator=generator
    )

    train_dataset = torch.utils.data.Subset(full_dataset, train_idx)
    val_dataset = torch.utils.data.Subset(val_dataset, val_idx)
    test_dataset = torch.utils.data.Subset(test_dataset, test_idx)

    train_loader = DataLoader(
        train_dataset, batch_size=batch_size, shuffle=True,
        num_workers=num_workers, pin_memory=True,
    )
    val_loader = DataLoader(
        val_dataset, batch_size=batch_size, shuffle=False,
        num_workers=num_workers, pin_memory=True,
    )
    test_loader = DataLoader(
        test_dataset, batch_size=batch_size, shuffle=False,
        num_workers=num_workers, pin_memory=True,
    )

    return train_loader, val_loader, test_loader, full_dataset
