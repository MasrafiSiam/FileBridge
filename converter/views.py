
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse

from .services import convert_to_pdf, ConversionError


MAX_FILE_SIZE = 25 * 1024 * 1024  # 25 MB


def home(request):
    if request.method == "GET":
        return render(request, "converter/index.html")

    if request.method != "POST":
        return JsonResponse(
            {"error": "Method not allowed."},
            status=405
        )

    uploaded_file = request.FILES.get("file")

    if not uploaded_file:
        return JsonResponse(
            {"error": "Please select a document."},
            status=400
        )

    if uploaded_file.size > MAX_FILE_SIZE:
        return JsonResponse(
            {"error": "File size must not exceed 25 MB."},
            status=413
        )

    try:
        pdf_data = convert_to_pdf(uploaded_file)

        response = HttpResponse(
            pdf_data,
            content_type="application/pdf"
        )

        response["Content-Disposition"] = (
            'attachment; filename="converted.pdf"'
        )

        response["Content-Length"] = len(pdf_data)

        return response

    except ConversionError as error:
        return JsonResponse(
            {"error": str(error)},
            status=422
        )
