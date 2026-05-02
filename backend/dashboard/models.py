from django.db import models


class SchoolSettings(models.Model):
    name = models.CharField(max_length=200, default='High Profile Private Secondary School')
    short_name = models.CharField(max_length=20, default='HPSS')
    motto = models.CharField(max_length=200, default='Excellence in Education')
    address = models.CharField(max_length=300, default='Zomba, Malawi')
    phone = models.CharField(max_length=20, default='+265 1 234 567')
    email = models.EmailField(default='info@highprofile.edu.mw')
    primary_color = models.CharField(max_length=7, default='#1E40AF')
    secondary_color = models.CharField(max_length=7, default='#3B82F6')
    theme = models.CharField(max_length=20, default='blue', choices=[
        ('blue', 'Blue'),
        ('green', 'Green'),
        ('red', 'Red'),
        ('custom', 'Custom'),
    ])

    class Meta:
        verbose_name = 'School Settings'

    def __str__(self):
        return self.name

    @classmethod
    def get_settings(cls):
        settings, _ = cls.objects.get_or_create(pk=1)
        return settings
