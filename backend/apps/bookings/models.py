from django.db import models
from uuid import uuid4

from apps.core.models import AbstractBaseModel
# Create your models here.
class Booking(AbstractBaseModel):
    id = models.UUIDField(default=uuid4(), unique=True, primary_key=True)
    booking_number = models.CharField(max_length=255, null=True)
    user = models.ForeignKey("users.User", on_delete=models.SET_NULL, null=True, related_name="slotbookings")
    slot = models.ForeignKey("spaces.SpaceSlot", on_delete=models.CASCADE, related_name="slotbookings")
    deposit_paid = models.BooleanField(default=False)
    amount_expected = models.DecimalField(max_digits=100, decimal_places=2)
    amount_paid = models.DecimalField(max_digits=100, decimal_places=2)
    status = models.CharField(max_length=50, default="Pending")

    def __str__(self) -> str:
        return f"{str(self.id)}"
    

class BookingStatus(AbstractBaseModel):
    id = models.UUIDField(default=uuid4(), unique=True, primary_key=True)
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE)
    current_status = models.CharField(max_length=255)
    next_status = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.current_status} => {self.next_status}"