
const fileInput = document.getElementById("file-input");
const dropArea = document.getElementById("drop-area");
const fileInfo = document.getElementById("file-info");
const fileName = document.getElementById("file-name");
const removeButton = document.getElementById("remove-file");
const convertButton = document.getElementById("convert-button");

const csrfToken = document.querySelector(
    "[name=csrfmiddlewaretoken]"
).value;

const MAX_FILE_SIZE = 25 * 1024 * 1024;

const ALLOWED_EXTENSIONS = [".docx", ".pptx"];

let selectedFile = null;


// Select and validate a file
function selectFile(file) {
    if (!file) return;

    const extension = file.name
        .substring(file.name.lastIndexOf("."))
        .toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
        alert("Please select a DOCX or PPTX file.");
        return;
    }

    if (file.size > MAX_FILE_SIZE) {
        alert("File size must not exceed 25 MB.");
        return;
    }

    selectedFile = file;

    fileName.textContent = file.name;
    fileInfo.hidden = false;

    convertButton.disabled = false;
    convertButton.textContent = "Convert to PDF";
}


// Browse files
fileInput.addEventListener("change", () => {
    selectFile(fileInput.files[0]);
});


// Drag over
dropArea.addEventListener("dragover", (event) => {
    event.preventDefault();

    dropArea.classList.add("drag-over");
});


// Drag leave
dropArea.addEventListener("dragleave", () => {
    dropArea.classList.remove("drag-over");
});


// Drop file
dropArea.addEventListener("drop", (event) => {
    event.preventDefault();

    dropArea.classList.remove("drag-over");

    const file = event.dataTransfer.files[0];

    selectFile(file);
});


// Remove selected file
removeButton.addEventListener("click", () => {
    selectedFile = null;

    fileInput.value = "";
    fileInfo.hidden = true;

    convertButton.disabled = true;
    convertButton.textContent = "Convert to PDF";
});


// Convert document
convertButton.addEventListener("click", async () => {
    if (!selectedFile) return;

    const formData = new FormData();

    formData.append("file", selectedFile);

    convertButton.disabled = true;
    convertButton.textContent = "Converting...";

    try {
        const response = await fetch("/", {
            method: "POST",

            headers: {
                "X-CSRFToken": csrfToken
            },

            body: formData
        });

        if (!response.ok) {
            let errorMessage = "Conversion failed.";

            try {
                const error = await response.json();
                errorMessage = error.error || errorMessage;
            } catch {
                // Response wasn't JSON.
            }

            throw new Error(errorMessage);
        }

        const pdfBlob = await response.blob();

        const downloadUrl = URL.createObjectURL(pdfBlob);

        const link = document.createElement("a");

        link.href = downloadUrl;
        link.download = `${selectedFile.name.replace(/\.[^.]+$/, "")}.pdf`;

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(downloadUrl);

        convertButton.textContent = "Downloaded!";

    } catch (error) {
        alert(error.message);

        convertButton.textContent = "Convert to PDF";

    } finally {
        convertButton.disabled = false;
    }
});


console.log("FileBridge initialized.");
