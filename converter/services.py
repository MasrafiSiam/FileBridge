import os
import subprocess
import tempfile
from pathlib import Path


DOCKER_IMAGE = "filebridge-converter"
SUPPORTED_FORMATS = {".docx", ".pptx"}
CONVERSION_TIMEOUT = 90


class ConversionError(Exception):
    """Raised when document conversion fails."""


def convert_to_pdf(uploaded_file):
    extension = Path(uploaded_file.name).suffix.lower()

    if extension not in SUPPORTED_FORMATS:
        raise ConversionError("Unsupported file format.")

    input_filename = f"input{extension}"

    try:
        with tempfile.TemporaryDirectory(prefix="filebridge-") as temp_dir:

            work_dir = Path(temp_dir)
            input_path = work_dir / input_filename
            output_path = work_dir / "input.pdf"

            # Save the uploaded document temporarily.
            with input_path.open("wb") as destination:
                for chunk in uploaded_file.chunks():
                    destination.write(chunk)

            # Run LibreOffice inside an isolated Docker container.
            command = [
                "docker", "run",
                "--rm",
                "--network", "none",
                "--read-only",
                "--memory", "1g",
                "--cpus", "2",
                "--pids-limit", "100",
                "--cap-drop", "ALL",
                "--security-opt", "no-new-privileges",
                "--tmpfs", "/tmp:rw,nosuid,nodev,size=256m",
                "--user", f"{os.getuid()}:{os.getgid()}",
                "-e", "HOME=/tmp",
                "-v", f"{temp_dir}:/work",
                DOCKER_IMAGE,
                "libreoffice",
                "--headless",
                "-env:UserInstallation=file:///tmp/lo-profile",
                "--convert-to", "pdf",
                "--outdir", "/work",
                f"/work/{input_filename}",
            ]

            result = subprocess.run(
                command,
                capture_output=True,
                text=True,
                timeout=CONVERSION_TIMEOUT,
                check=False,
            )

            if result.returncode != 0:
                raise ConversionError(
                    f"LibreOffice conversion failed: {result.stderr[-1000:]}"
                )

            if not output_path.is_file():
                raise ConversionError("LibreOffice did not produce a PDF.")

            # Read the PDF before the temporary directory is deleted.
            return output_path.read_bytes()

    except subprocess.TimeoutExpired as error:
        raise ConversionError("Conversion took too long.") from error

    except FileNotFoundError as error:
        raise ConversionError("Docker could not be found.") from error

    except OSError as error:
        raise ConversionError("Unable to process the uploaded file.") from error