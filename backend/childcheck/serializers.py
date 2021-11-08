from .models import *

from datetime import date
from rest_framework import serializers, validators


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'first_name',
            'last_name',
            'email',
            'is_active',
            'is_staff',
        ]


class ChildCheckSerializer(serializers.ModelSerializer):
    present = serializers.SerializerMethodField()

    class Meta:
        model = Child
        fields = [
            'id',
            'first_name',
            'last_name',
            'child_id',
            'photo',
            'present',
        ]

    def get_present(self, obj):
        checks = Check.objects.filter(
            date=date.today(), child=obj, out_time__isnull=True)
        count = checks.count()
        if count == 0:
            return False
        elif count == 1:
            return checks.first().pk
        else:
            return checks.order_by('-pk').first().pk


class GuardianSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = Guardian
        fields = [
            'id',
            'first_name',
            'last_name',
            'phone_number',
            'guardian_id',
            'photo',
            'children',
        ]

    def get_children(self, obj):
        children = Child.objects.filter(guardians=obj)
        return ChildCheckSerializer(children, many=True).data

    def validate_guardian_id(self, value):
        c_exists = Child.objects.filter(child_id=value).exists()
        g_exists = Guardian.objects.filter(guardian_id=value).exists()
        if c_exists or g_exists:
            raise serializers.ValidationError('This Id already exists')
        return value



class ChildSerializer(serializers.ModelSerializer):
    class Meta:
        model = Child
        fields = '__all__'

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data.update({
            'guardians': GuardianSerializer(instance.guardians, many=True).to_representation(instance.guardians),
        })
        return data

    def validate_child_id(self, value):
        c_exists = Child.objects.filter(child_id=value).exists()
        g_exists = Guardian.objects.filter(guardian_id=value).exists()
        if c_exists or g_exists:
            raise serializers.ValidationError('This Id already exists')
        return value


class CheckSerializer(serializers.ModelSerializer):
    class Meta:
        model = Check
        fields = '__all__'

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data.update({
            'child': ChildCheckSerializer(instance.child).data,
            'out_guardian': GuardianSerializer(instance.out_guardian).data,
            'out_supervisor': UserSerializer(instance.out_supervisor).data,
        })
        return data

    def validate_child(self, value):
        if Check.objects.filter(child=value, out_time__isnull=True).exists():
            raise serializers.ValidationError('This Child is already checked in')
        return value
