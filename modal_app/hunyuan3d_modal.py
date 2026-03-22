"""
Hunyuan3D-2 Image-to-3D on Modal
- Accepts base64-encoded image (no external image hosting needed)
- Generates geometry-only GLB using Hunyuan3D-DiT-v2-0-Turbo
- Stores GLB in Modal Volume
- Exposes a /serve-glb endpoint to serve files publicly via URL
"""

import modal
import io

app = modal.App("hunyuan3d-image-to-3d")

image = (
    modal.Image.from_registry(
        "nvidia/cuda:12.1.0-devel-ubuntu22.04",
        add_python="3.11"
    )
    .apt_install(
        "git",
        "libgl1-mesa-glx",
        "libglib2.0-0",
    )
    .pip_install(
        "torch==2.6.0",
        "torchvision",
        extra_index_url="https://download.pytorch.org/whl/cu121"
    )
    .pip_install(
        "Pillow",
        "numpy",
        "trimesh",
        "requests",
        "rembg[gpu]",
        "huggingface_hub",
        "fastapi",
        "python-multipart",
    )
    .run_commands(
        "git clone https://github.com/Tencent-Hunyuan/Hunyuan3D-2.git /tmp/hunyuan3d",
        "cd /tmp/hunyuan3d && pip install -e .",
    )
    .env({"HF_HOME": "/root/.cache/huggingface"})
    .run_commands(
        'python3 -c "from huggingface_hub import snapshot_download; '
        'snapshot_download(\'tencent/Hunyuan3D-2\', allow_patterns=[\'hunyuan3d-dit-v2-0-turbo/*\'])"',
    )
)

volume = modal.Volume.from_name("hunyuan3d-models", create_if_missing=True)
VOLUME_PATH = "/models"


# ---------------------------------------------------------------------------
# Core generation function
# ---------------------------------------------------------------------------

@app.function(
    image=image,
    gpu="H100",
    cloud="gcp",
    timeout=900,
    volumes={VOLUME_PATH: volume},
    memory=16384,
)
def generate_glb_from_base64(image_b64: str, output_name: str = "model.glb", remove_bg: bool = True) -> dict:
    """
    Generate a geometry-only GLB from a base64-encoded image.
    Stores the GLB in the Modal Volume and returns it as base64.
    """
    import base64
    import os
    import time
    import torch
    from PIL import Image
    from rembg import remove as remove_background
    from hy3dgen.shapegen import Hunyuan3DDiTFlowMatchingPipeline

    total_start = time.time()
    print("=" * 60)
    print("HUNYUAN3D-2 — GEOMETRY GENERATION")
    print("=" * 60)

    if torch.cuda.is_available():
        print(f"✓ GPU: {torch.cuda.get_device_name(0)}")

    # Decode base64 image
    image_bytes = base64.b64decode(image_b64)
    input_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    print(f"✓ Image loaded: {input_image.size[0]}x{input_image.size[1]}")

    # Background removal
    if remove_bg:
        t = time.time()
        input_image = remove_background(input_image)
        print(f"✓ Background removed ({time.time()-t:.1f}s)")

    # Load shape pipeline & generate mesh
    t = time.time()
    shape_pipeline = Hunyuan3DDiTFlowMatchingPipeline.from_pretrained(
        "tencent/Hunyuan3D-2",
        subfolder="hunyuan3d-dit-v2-0-turbo",
        use_safetensors=True,
    )
    print(f"✓ Pipeline loaded ({time.time()-t:.1f}s)")

    t = time.time()
    result = shape_pipeline(
        input_image,
        num_inference_steps=15,
        guidance_scale=7.5,
    )
    mesh = result[0] if isinstance(result, (list, tuple)) else result
    print(f"✓ Mesh generated ({time.time()-t:.1f}s)")

    torch.cuda.empty_cache()

    # Export to GLB in Volume
    glb_filename = output_name if output_name.endswith(".glb") else f"{output_name}.glb"
    glb_path = os.path.join(VOLUME_PATH, glb_filename)
    os.makedirs(VOLUME_PATH, exist_ok=True)
    mesh.export(glb_path)

    file_size_mb = os.path.getsize(glb_path) / 1024 / 1024
    print(f"✓ Saved: {glb_path} ({file_size_mb:.2f} MB)")

    with open(glb_path, "rb") as f:
        glb_bytes = f.read()

    volume.commit()

    total_time = round(time.time() - total_start, 1)
    print(f"✅ Done in {total_time}s ({total_time/60:.1f} min)")

    return {
        "success": True,
        "glb_filename": glb_filename,
        "glb_b64": __import__("base64").b64encode(glb_bytes).decode("utf-8"),
        "total_time_seconds": total_time,
        "file_size_mb": round(file_size_mb, 2),
    }


# ---------------------------------------------------------------------------
# Web endpoint 1: POST /generate — accepts base64 image, returns GLB URL
# ---------------------------------------------------------------------------

@app.function(
    image=image,
    gpu="H100",
    cloud="gcp",
    timeout=900,
    volumes={VOLUME_PATH: volume},
    memory=16384,
)
@modal.web_endpoint(method="POST")
def generate(request: dict):
    """
    POST /generate
    Body: {
      "image_b64": "<base64-encoded-image>",
      "output_name": "burger.glb",   // optional
      "remove_bg": true               // optional, default true
    }
    Returns: {
      "success": true,
      "glb_filename": "burger.glb",
      "glb_b64": "<base64-encoded-glb>",
      "total_time_seconds": 45.2
    }
    """
    image_b64 = request.get("image_b64")
    if not image_b64:
        return {"success": False, "error": "image_b64 is required"}

    output_name = request.get("output_name", "model.glb")
    remove_bg = request.get("remove_bg", True)

    return generate_glb_from_base64.remote(image_b64, output_name, remove_bg)


# ---------------------------------------------------------------------------
# Web endpoint 2: GET /serve-glb?filename=burger.glb — serves GLB from Volume
# ---------------------------------------------------------------------------

@app.function(
    image=modal.Image.debian_slim().pip_install("fastapi"),
    volumes={VOLUME_PATH: volume},
    timeout=30,
)
@modal.web_endpoint(method="GET")
def serve_glb(filename: str):
    """
    GET /serve-glb?filename=burger.glb
    Serves a GLB file from the Modal Volume.
    """
    import os
    from fastapi.responses import Response

    volume.reload()
    glb_path = os.path.join(VOLUME_PATH, filename)

    if not os.path.exists(glb_path):
        from fastapi.responses import JSONResponse
        return JSONResponse({"error": f"File not found: {filename}"}, status_code=404)

    with open(glb_path, "rb") as f:
        data = f.read()

    return Response(
        content=data,
        media_type="model/gltf-binary",
        headers={
            "Content-Disposition": f'inline; filename="{filename}"',
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "public, max-age=86400",
        },
    )


# ---------------------------------------------------------------------------
# Local test entrypoint
# ---------------------------------------------------------------------------

@app.local_entrypoint()
def main(image_path: str = None):
    if not image_path:
        print("Usage: modal run modal_app/hunyuan3d_modal.py --image-path /path/to/food.jpg")
        return

    import base64
    from pathlib import Path

    with open(image_path, "rb") as f:
        image_b64 = base64.b64encode(f.read()).decode("utf-8")

    result = generate_glb_from_base64.remote(image_b64)
    print(f"\n✅ Done in {result['total_time_seconds']}s")
    print(f"   GLB filename: {result['glb_filename']} ({result['file_size_mb']} MB)")

    output_path = Path("output") / result["glb_filename"]
    output_path.parent.mkdir(exist_ok=True)
    output_path.write_bytes(base64.b64decode(result["glb_b64"]))
    print(f"   Saved locally: {output_path.absolute()}")
