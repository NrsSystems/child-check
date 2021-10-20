from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from phonenumber_field.modelfields import PhoneNumberField
from rest_framework.authtoken.models import Token


class UserManager(BaseUserManager):
    def create_user(self, email, password, **extra_fields):
        if email:
            email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        user.save()
        Token.objects.create(user=user)
        return user

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    email = models.EmailField(unique=True, blank=True, null=True)
    password = models.CharField(max_length=128, blank=True, null=True, verbose_name='password')
    username = None
    user_permissions = None
    groups = None

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    objects = UserManager()

    def __str__(self):
        return self.email


class Guardian(models.Model):
    def upload_path(instance, filename):
        return filename

    first_name = models.CharField(max_length=128)
    last_name = models.CharField(max_length=128)
    guardian_id = models.CharField(max_length=128)
    phone_number = PhoneNumberField(null=True, blank=True)
    photo = models.ImageField(null=True, blank=True, upload_to=upload_path)


class Child(models.Model):
    def upload_path(instance, filename):
        return filename

    first_name = models.CharField(max_length=128)
    last_name = models.CharField(max_length=128)
    child_id = models.CharField(max_length=128)
    photo = models.ImageField(null=True, blank=True, upload_to=upload_path)
    guardians = models.ManyToManyField(Guardian, blank=True)


class Check(models.Model):
    date = models.DateField(auto_now_add=True)
    in_time = models.TimeField(auto_now_add=True)
    out_time = models.TimeField(blank=True, null=True)
    child = models.ForeignKey(Child, blank=True, null=True, on_delete=models.SET_NULL)
    out_guardian = models.ForeignKey(Guardian, null=True, blank=True, on_delete=models.SET_NULL, related_name='out_guardian')
    out_supervisor = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='in_guardian')
