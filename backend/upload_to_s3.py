"""
Upload the local clothing dataset to S3.
Usage: python upload_to_s3.py --bucket style-alyst-images --dataset-dir /path/to/archive
"""
import os
import argparse
import boto3
from tqdm import tqdm

SUPPORTED_EXTENSIONS = ('.png', '.jpg', '.jpeg', '.webp')

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--bucket", required=True, help="S3 bucket name")
    parser.add_argument("--dataset-dir", required=True, help="Local path to clothing dataset")
    parser.add_argument("--region", default="us-east-1")
    args = parser.parse_args()

    s3 = boto3.client("s3", region_name=args.region)

    # Collect all image files
    image_files = []
    for root, dirs, files in os.walk(args.dataset_dir):
        folder_name = os.path.basename(root)
        if folder_name == os.path.basename(args.dataset_dir):
            continue
        for f in files:
            if f.lower().endswith(SUPPORTED_EXTENSIONS):
                image_files.append((os.path.join(root, f), f"{folder_name}/{f}"))

    print(f"Found {len(image_files)} images. Uploading to s3://{args.bucket}/...")

    content_types = {'.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp'}

    for local_path, s3_key in tqdm(image_files, desc="Uploading"):
        ext = os.path.splitext(local_path)[1].lower()
        try:
            s3.upload_file(
                local_path, args.bucket, s3_key,
                ExtraArgs={"ContentType": content_types.get(ext, "image/jpeg")}
            )
        except Exception as e:
            print(f"Failed to upload {s3_key}: {e}")

    print(f"Done. Uploaded {len(image_files)} images to s3://{args.bucket}/")

if __name__ == "__main__":
    main()
