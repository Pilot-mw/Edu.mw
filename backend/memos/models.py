import mongoengine
from datetime import datetime


class Memo(mongoengine.Document):
    title = mongoengine.StringField(required=True, max_length=200)
    message = mongoengine.StringField(required=True, max_length=5000)
    audience = mongoengine.StringField(required=True, choices=['teachers', 'students', 'all'], default='all')
    created_by = mongoengine.StringField(required=True)
    important = mongoengine.BooleanField(default=False)
    attachment_url = mongoengine.StringField(default=None)
    file_name = mongoengine.StringField(default=None)
    file_type = mongoengine.StringField(default=None, choices=['pdf', 'jpg', 'jpeg', 'png', 'gif'])
    expiry_date = mongoengine.DateTimeField(default=None)
    created_at = mongoengine.DateTimeField(default=datetime.utcnow)
    updated_at = mongoengine.DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'memos',
        'ordering': ['-important', '-created_at'],
        'indexes': [
            'audience',
            'expiry_date',
        ],
    }

    def save(self, *args, **kwargs):
        if not self.id:
            self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        return super().save(*args, **kwargs)

    def to_dict(self):
        return {
            'id': str(self.id),
            'title': self.title,
            'message': self.message,
            'audience': self.audience,
            'created_by': self.created_by,
            'important': self.important,
            'attachment_url': self.attachment_url,
            'file_name': self.file_name,
            'file_type': self.file_type,
            'expiry_date': self.expiry_date.isoformat() if self.expiry_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
