import torch


def export_to_onnx(model: torch.nn.Module, output_path: str = "model.onnx"):
    model.eval()
    dummy_numerical = torch.randn(1, 20)
    dummy_cat = []
    dummy_images = {
        mod: torch.randn(1, 3, 224, 224) if mod != "ct_mri" else None
        for mod in ["face", "side_profile", "neck", "ultrasound", "ct_mri"]
    }
    torch.onnx.export(
        model,
        (dummy_numerical, dummy_cat, dummy_images),
        output_path,
        input_names=["numerical", "images"],
        output_names=["logits"],
        dynamic_axes={"numerical": {0: "batch"}, "images": {0: "batch"}},
        opset_version=17,
    )
    print(f"Model exported to {output_path}")
