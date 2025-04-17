import boto3
import os
import subprocess
import json

s3 = boto3.client('s3')

def get_video_duration(input_path):
    """ Get the duration of a video using FFmpeg """
    cmd = [
        "ffprobe", 
        "-v", "error", 
        "-show_entries", "format=duration", 
        "-of", "json",
        input_path
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    duration = float(json.loads(result.stdout)["format"]["duration"])
    return duration

def process_video(input_path, output_path, duration):
    """ Extract first 2s, middle 3s, and last 3s, then merge them """
    first_clip = "/tmp/first.mp4"
    middle_clip = "/tmp/middle.mp4"
    last_clip = "/tmp/last.mp4"
    file_list_path = "/tmp/file_list.txt"  # ✅ Write in /tmp/

    # Extract first 2 seconds
    subprocess.run(["ffmpeg", "-i", input_path, "-t", "2", "-c", "copy", first_clip])

    # Extract middle 3 seconds
    middle_start = max(0, (duration / 2) - 1.5)  # Centered middle 3 seconds
    subprocess.run(["ffmpeg", "-i", input_path, "-ss", str(middle_start), "-t", "3", "-c", "copy", middle_clip])

    # Extract last 3 seconds
    subprocess.run(["ffmpeg", "-i", input_path, "-sseof", "-3", "-c", "copy", last_clip])

    # Write file list in /tmp/
    with open(file_list_path, "w") as f:
        f.write(f"file '{first_clip}'\nfile '{middle_clip}'\nfile '{last_clip}'\n")

    # Concatenate clips
    subprocess.run(["ffmpeg", "-f", "concat", "-safe", "0", "-i", file_list_path, "-c", "copy", output_path])


def lambda_handler(event, context):
    # Get bucket and file details from the S3 event
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = event['Records'][0]['s3']['object']['key']
    
    temp_input = "/tmp/input.mp4"
    temp_output = "/tmp/preview.mp4"

    # Download the video from S3
    s3.download_file(bucket, key, temp_input)

    # Get video duration
    duration = get_video_duration(temp_input)

    # Process the video
    process_video(temp_input, temp_output, duration)

    # Upload the preview back to another S3 bucket
    preview_bucket = "frontleft-video-preview-bucket"  # Change to your actual preview bucket
    preview_key = f"preview_{key}"
    s3.upload_file(temp_output, preview_bucket, preview_key)

    return {
        "statusCode": 200,
        "body": json.dumps(f"Preview video uploaded to {preview_bucket}/{preview_key}")
    }
