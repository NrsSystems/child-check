from django.db.models.expressions import F
from .filters import *
from . models import *
from .parsers import *
from .permissions import *
from .serializers import *

import csv
import datetime
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
import jwt
import os
from rest_framework import permissions
from rest_framework.authtoken.views import Token
from rest_framework.exceptions import PermissionDenied
from rest_framework.parsers import JSONParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
import shutil

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


class ReportView(APIView):
    permission_classes = []

    def post(self, request, format=None):
        if 'date' in request.data.keys():
            checks = Check.objects.filter(date=request.data['date'], out_time__isnull=False).order_by('child__last_name', 'child__first_name', 'date')
        elif 'range' in request.data.keys():
            checks = Check.objects.filter(date__range=request.data['range'], out_time__isnull=False).order_by('child__last_name', 'child__first_name', 'date')
        else:
            return Response('Invalid Input', 400)

        response = HttpResponse(
            content_type='text/csv',
            headers={'Content-Disposition': 'attachment; filename="childcheck_report.csv"'},
        )
        writer = csv.writer(response)
        writer.writerow(['First Name', 'Last Name', 'date', 'Time (hr)'])
        for check in checks:
            delta = datetime.datetime.combine(datetime.date.today(), check.out_time) - datetime.datetime.combine(datetime.date.today(), check.in_time)
            writer.writerow([
                check.child.first_name,
                check.child.last_name,
                check.date,
                round(delta.days * 24 + delta.seconds / 3600.0, 2)
            ])
        return response


class BackupView(APIView):
    permission_classes = []

    def get(self, request, format=None):
        dir = settings.APP_DATA or settings.BASE_DIR
        dir = str(dir)
        shutil.copytree(dir + '/media', dir + '/backup')
        shutil.copy(dir + '/db.sqlite3', dir + '/backup/db.sqlite3')
        shutil.make_archive('backup', 'zip', dir + '/backup')
        shutil.rmtree(dir + '/backup')
        file = open(dir + '/backup.zip', 'rb').read()
        response = HttpResponse(
            file,
            content_type='application/zip',
            headers={'Content-Disposition': 'attachment; filename="backup.zip"'},
        )
        os.remove(dir + '/backup.zip')
        return response

    def post(self, request, format=None):
        dir = settings.APP_DATA or settings.BASE_DIR
        dir = str(dir)
        default_storage.save('backup.zip', ContentFile(request.data['archive'].read()))
        shutil.move(dir + '/media/backup.zip', dir + '/backup.zip')
        shutil.unpack_archive(dir + '/backup.zip', dir + '/backup')
        if os.path.exists(dir + '/backup/db.sqlite3'):
            os.remove(dir + '/db.sqlite3')
            shutil.rmtree(dir + '/media')
            shutil.move(dir + '/backup/db.sqlite3', dir + '/db.sqlite3')
            shutil.move(dir + '/backup', dir + '/media')
            os.remove(dir + '/backup.zip')
        else:
            shutil.rmtree(dir + '/backup')
            os.remove(dir + '/backup.zip')
            return Response('Incorrect Archive', 400)
        return Response('Success')


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
