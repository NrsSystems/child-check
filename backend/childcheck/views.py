from .filters import *
from . models import *
from .parsers import *
from .permissions import *
from .serializers import *

import datetime
from django.conf import settings
from django.shortcuts import get_object_or_404, render
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
import jwt
from rest_framework import permissions
from rest_framework.authtoken.views import Token
from rest_framework.exceptions import PermissionDenied
from rest_framework.parsers import JSONParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet

def send_response(token):
    user = token.user
    access_token = jwt.encode(
        {'id': user.pk, 'exp': timezone.now().utcnow() + datetime.timedelta(hours=12)},
        settings.SECRET_KEY,
    )

    response = Response({
        'id': user.pk,
        'email': user.email,
        'name': user.get_full_name(),
        'token': access_token,
        'active': user.is_active,
        'staff': user.is_staff,
        'admin': user.is_superuser,
    })
    response.set_cookie(
        'user',
        token.key,
        expires=(timezone.now().utcnow() + datetime.timedelta(hours=12)),
        httponly=True,
    )
    return response

def change_password(user, password):
    if not user.check_password(password):
        user.set_password(password)
        user.save()
    else:
        raise PermissionDenied("New password cannot be old password")


class ChildViewSet(ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, StaffMixin]
    serializer_class = ChildSerializer
    parser_classes = [MultipartJsonParser, JSONParser]
    filter_backends = [DjangoFilterBackend,]
    filterset_class = ChildFilter
    queryset = Child.objects.all().order_by('-pk')

    def perform_update(self, serializer):
        if serializer.partial:
            child = serializer.instance
            if 'add' in self.request.data.keys():
                guardian = get_object_or_404(Guardian, pk=self.request.data['add'])
                child.guardians.add(guardian)
            if 'remove' in self.request.data.keys():
                guardian = get_object_or_404(Guardian, pk=self.request.data['remove'])
                child.guardians.remove(guardian)
        serializer.save()


class GuardianViewSet(ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, StaffMixin]
    serializer_class = GuardianSerializer
    filter_backends = [DjangoFilterBackend,]
    filterset_class = GuardianFilter
    queryset = Guardian.objects.all().order_by('-pk')


class CheckViewSet(ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, StaffMixin]
    serializer_class = CheckSerializer
    filter_backends = [DjangoFilterBackend,]
    filterset_class = CheckFilter
    queryset = Check.objects.all().order_by('-pk')

    def perform_update(self, serializer):
        if serializer.partial and 'out_guardian' in self.request.data.keys():
            serializer.save(out_supervisor=self.request.user, out_time=timezone.localtime(timezone.now()).time())
        else:
            serializer.save()


class UserViewSet(ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, UserMixin]
    serializer_class = UserSerializer
    queryset = User.objects.all().order_by('-pk')

    def perform_update(self, serializer):
        if serializer.partial:
            user = serializer.instance
            data = self.request.data
            if all(x in data.keys() for x in ['old_password', 'new_password']):
                if user.check_password(data['old_password']):
                    change_password(user, data['new_password'])
                else:
                    raise PermissionDenied("Current Password is Incorrect")
        serializer.save()


class ScanView(APIView):
    permission_classes = [permissions.IsAuthenticated, StaffMixin]

    def get(self, request, format=None):
        code = request.query_params.get('id', None)
        child = Child.objects.filter(child_id=code)
        if child.exists():
            child = child.first()
            data = ChildSerializer(child).to_representation(child)
            return Response(data)
        guardian = Guardian.objects.filter(guardian_id=code)
        if guardian.exists():
            guardian = guardian.first()
            data = GuardianSerializer(guardian).to_representation(guardian)
            return Response(data)
        return Response("Id not Found", 404)


class LoginView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request, format=None):
        refresh = request.COOKIES.get('user', None)
        token = get_object_or_404(Token, key=refresh)
        return send_response(token)

    def post(self, request, format=None):
        user = User.objects.create_user(
            email=request.data['email'],
            password=request.data['password'],
            first_name=request.data['first_name'],
            last_name=request.data['last_name'],
            is_active=False,
        )
        if User.objects.all().count() == 1:
            user.is_active = True
            user.is_staff = True
            user.is_superuser = True
            user.save()
        token = Token.objects.get(user=user)
        return send_response(token)

    def put(self, request, format=None):
        user = get_object_or_404(User, email=request.data.get('email', None))
        if user.check_password(request.data.get('password', None)):
            return send_response(get_object_or_404(Token, user=user))
        else:
            raise PermissionDenied("Invalid Email or Password")

    def delete(self, request, format=None):
        response = Response('Logout Successful')
        response.delete_cookie('user')
        return response
