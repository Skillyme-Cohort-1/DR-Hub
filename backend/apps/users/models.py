from django.db import models
from uuid import uuid4

from django.contrib.auth.models import AbstractUser
from apps.core.models import AbstractBaseModel

# Create your models here.
class User(AbstractUser, AbstractBaseModel):
    id = models.UUIDField(default=uuid4(), unique=True, primary_key=True)
    gender = models.CharField(max_length=10, blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    id_number = models.CharField(max_length=20, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, default="Kenya", blank=True, null=True)
    role = models.CharField(max_length=255, default="Member")

    def __str__(self):
        return self.get_full_name() or self.email