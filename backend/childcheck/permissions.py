from rest_framework import permissions


class StaffMixin(permissions.BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if user.is_active:
            return True
        else:
            return False


class UserMixin(permissions.BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if request.method in ['PATCH', 'PUT']:
            protected_fields = [
                'is_active',
                'is_staff',
            ]
            for field in protected_fields:
                if field in request.data.keys() and not user.is_staff:
                    return False
        return True
