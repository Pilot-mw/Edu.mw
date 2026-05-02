import os
import uuid
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils import timezone
from datetime import datetime
from .models import Memo


@csrf_exempt
@require_http_methods(["GET"])
def memo_list(request):
    audience = request.GET.get('audience', None)
    now = timezone.now()

    memos = Memo.objects()

    if audience in ('teachers', 'students'):
        memos = memos(audience__in=[audience, 'all'])

    filtered = []
    for memo in memos.order_by('-important', '-created_at'):
        if memo.expiry_date and memo.expiry_date < now:
            continue
        filtered.append(memo.to_dict())

    return JsonResponse({'success': True, 'data': filtered, 'count': len(filtered)})


@csrf_exempt
@require_http_methods(["POST"])
def memo_create(request):
    try:
        title = request.POST.get('title', '').strip()
        message = request.POST.get('message', '').strip()
        audience = request.POST.get('audience', '').strip()
        created_by = request.POST.get('createdBy', request.POST.get('created_by', '')).strip()
        important = request.POST.get('important', 'false').lower() == 'true'
        expiry_date_str = request.POST.get('expiryDate', request.POST.get('expiry_date', '')).strip()

        if not title or not message or not audience or not created_by:
            return JsonResponse({'success': False, 'message': 'Title, message, audience, and creator are required'}, status=400)

        if audience not in ('teachers', 'students', 'all'):
            return JsonResponse({'success': False, 'message': 'Audience must be teachers, students, or all'}, status=400)

        expiry_date = None
        if expiry_date_str:
            try:
                expiry_date = datetime.fromisoformat(expiry_date_str.replace('Z', '+00:00'))
            except ValueError:
                pass

        attachment_url = None
        file_name = None
        file_type = None

        if 'file' in request.FILES:
            uploaded_file = request.FILES['file']
            allowed_extensions = {'.pdf', '.jpg', '.jpeg', '.png', '.gif'}
            allowed_mime_types = {'application/pdf', 'image/jpeg', 'image/png', 'image/gif'}

            ext = os.path.splitext(uploaded_file.name)[1].lower()
            if ext not in allowed_extensions and uploaded_file.content_type not in allowed_mime_types:
                return JsonResponse({'success': False, 'message': 'Only PDF, JPG, PNG, and GIF files are allowed'}, status=400)

            if uploaded_file.size > 5 * 1024 * 1024:
                return JsonResponse({'success': False, 'message': 'File size must be less than 5MB'}, status=400)

            upload_dir = os.path.join('media', 'uploads', 'memos')
            os.makedirs(upload_dir, exist_ok=True)

            unique_name = f"{uuid.uuid4().hex}_{uploaded_file.name}"
            file_path = os.path.join(upload_dir, unique_name)

            with open(file_path, 'wb+') as dest:
                for chunk in uploaded_file.chunks():
                    dest.write(chunk)

            attachment_url = f'/media/uploads/memos/{unique_name}'
            file_name = uploaded_file.name
            file_type = ext.lstrip('.')

        memo = Memo(
            title=title,
            message=message,
            audience=audience,
            created_by=created_by,
            important=important,
            expiry_date=expiry_date,
            attachment_url=attachment_url,
            file_name=file_name,
            file_type=file_type,
        )
        memo.save()

        return JsonResponse({'success': True, 'data': memo.to_dict()}, status=201)
    except Exception as e:
        return JsonResponse({'success': False, 'message': f'Failed to create memo: {str(e)}'}, status=500)


@csrf_exempt
@require_http_methods(["DELETE"])
def memo_delete(request, memo_id):
    try:
        memo = Memo.objects(id=memo_id).first()
        if not memo:
            return JsonResponse({'success': False, 'message': 'Memo not found'}, status=404)

        memo.delete()
        return JsonResponse({'success': True, 'message': 'Memo deleted'})
    except Exception as e:
        return JsonResponse({'success': False, 'message': f'Failed to delete memo: {str(e)}'}, status=500)
