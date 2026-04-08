from django.db import models
from apps.core.models import AbstractBaseModel

from uuid import uuid4

# Create your models here.
class Space(AbstractBaseModel):
    id = models.UUIDField(default=uuid4(), unique=True, primary_key=True)
    name = models.CharField(max_length=255)
    capacity = models.PositiveIntegerField(default=10)
    price_per_hour = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    slots = models.PositiveIntegerField(default=0)
    booked_slots = models.PositiveIntegerField(default=0)
    
    def __str__(self):
        return self.name


class SpaceComponent(AbstractBaseModel):
    id = models.UUIDField(default=uuid4(), unique=True, primary_key=True)
    space = models.ForeignKey(Space, related_name='components', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.space.name})"
    

class SpaceSlot(AbstractBaseModel):
    id = models.UUIDField(default=uuid4(), unique=True, primary_key=True)
    space = models.ForeignKey(Space, related_name='spaceslots', on_delete=models.CASCADE)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    is_booked = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.space.name} - {self.start_time} to {self.end_time}"