from .models import *

from django.conf import settings
from django.utils.translation import gettext_lazy as _
import jwt
from rest_framework.authentication import BaseAuthentication, get_authorization_header
from rest_framework.authtoken.models import Token
from rest_framework.exceptions import AuthenticationFailed


class JwtAuthentication(BaseAuthentication):
    keyword = 'Bearer'

    def authenticate(self, request):
        auth = get_authorization_header(request).split()

        if not auth or auth[0].lower() != self.keyword.lower().encode():
            return None

        if len(auth) == 1:
            msg = _('Invalid token header. No credentials provided.')
            raise AuthenticationFailed(msg)
        elif len(auth) > 2:
            msg = _('Invalid token header. Token string should not contain spaces.')
            raise AuthenticationFailed(msg)

        try:
            token = auth[1].decode()
        except UnicodeError:
            msg = _('Invalid token header. Token string should not contain invalid characters.')
            raise AuthenticationFailed(msg)

        try:
            token = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        except:
            raise AuthenticationFailed(_('Token Invalid or Expired'))

        try:
            user = User.objects.get(pk=token['id'])
            token = Token.objects.get(user=user)
        except User.DoesNotExist:
            raise AuthenticationFailed(_('Invalid token.'))
        except Token.DoesNotExist:
            raise AuthenticationFailed(_('Invalid token.'))

        if not user.is_active:
            raise AuthenticationFailed(_('User inactive or deleted.'))

        return (user, token)

    def authenticate_header(self, request):
        return self.keyword
