#!/usr/bin/env python3
import sys
import os
import json
import mimetypes
import magic
import base64
import subprocess
import socket
from datetime import datetime
import requests
from typing import Optional
import git

MAX_FILE_SIZE = 1024 * 1024  # 1MB in bytes


def file_info(file_path: str) -> dict:
    mime_type, _ = mimetypes.guess_type(file_path)
    file_type = magic.from_file(file_path, mime=True)
    description = magic.from_file(file_path)

    try:
        with exiftool.ExifTool() as et:
            metadata = et.get_metadata(file_path)
    except:
        metadata = None

    return {
        "mimeType": mime_type,
        "fileType": file_type,
        "description": description,
        "exifData": metadata,
    }


def check_file_size(file_path: str, from_stdin: bool = False):
    if from_stdin:
        content = sys.stdin.read()
        content_size = len(content.encode("utf-8"))
    else:
        content_size = os.path.getsize(file_path)

    if content_size > MAX_FILE_SIZE:
        raise ValueError("The file size is larger than 1MB.")

    return content_size


def is_binary(file_path: str) -> bool:
    with open(file_path, "rb") as file:
        return b"\0" in file.read()


def encode_content(file_path: str, is_binary: bool) -> str:
    with open(file_path, "rb" if is_binary else "r") as file:
        content = file.read()
        return base64.b64encode(content).decode("utf-8") if is_binary else content


def get_git_info(file_path: str) -> Optional[dict]:
    try:
        repo = git.Repo(file_path, search_parent_directories=True)
        repo_name = repo.working_dir.split("/")[-1]
        return {
            "gitPath": os.path.relpath(file_path, repo.working_tree_dir),
            "gitBranch": repo.active_branch.name,
            "gitCommitHash": repo.head.commit.hexsha,
            "gitRepoName": repo_name,
        }
    except git.InvalidGitRepositoryError:
        return None


def create_json_blob(comment: str, file_path: str, content_size: Optional[int]) -> dict:
    if file_path == "--":
        content = sys.stdin.read()
        file_info_str = {"fileType": "stdin"}
        is_binary_flag = False
        absolute_file_path = "stdin"
        git_info = None
    else:
        absolute_file_path = os.path.abspath(file_path)
        file_info_str = file_info(absolute_file_path)
        is_binary_flag = is_binary(absolute_file_path)
        content = encode_content(absolute_file_path, is_binary_flag)
        git_info = get_git_info(absolute_file_path)

    json_blob = {
        "filepath": absolute_file_path,
        "comment": comment,
        "isBinary": is_binary_flag,
        "content": content,
        "hostname": socket.gethostname(),
        "fileInfo": file_info_str,
        "viewedAt": datetime.now().isoformat(),
        "contentSize": content_size,
    }
    if git_info:
        json_blob.update(git_info)

    return json_blob


def send_json_blob(blob: dict, endpoint: str, key: str):
    headers = {
        "Content-Type": "application/json",
    }
    blob["key"] = key
    response = requests.post(endpoint, data=json.dumps(blob), headers=headers)
    response.raise_for_status()


def main():
    if len(sys.argv) < 2:
        print('Usage: python snapmemo.py "<comment>" ["<file path>"]')
        sys.exit(1)

    comment = sys.argv[1]
    file_path = sys.argv[2] if len(sys.argv) == 3 else "--"

    content_size = None
    try:
        content_size = check_file_size(file_path, from_stdin=(file_path == "--"))
    except ValueError as e:
        print(str(e))
        sys.exit(1)

    json_blob = create_json_blob(comment, file_path, content_size)

    # Read configuration from the parent directory
    config_file = os.path.join(
        os.path.dirname(os.path.abspath(__file__)), "..", "config.json"
    )
    with open(config_file, "r") as f:
        config = json.load(f)

    send_json_blob(json_blob, config["apiUrlCli"], config["key"])


if __name__ == "__main__":
    main()
