from .models import *

from django.db.models import Value as V
from django.db.models.functions import Concat
from django_filters import rest_framework as filters
from django_filters.filters import CharFilter


class GuardianFilter(filters.FilterSet):
    name = CharFilter(method='name_filter')
    first_name = CharFilter(field_name='first_name', lookup_expr='icontains')
    last_name = CharFilter(field_name='last_name', lookup_expr='icontains')
    order_by = CharFilter(method='order_filter')

    class Meta:
        model = Guardian
        fields = [
            'name',
            'first_name',
            'last_name',
            'order_by',
        ]

    def name_filter(self, queryset, name, value):
        return queryset.annotate(full_name=Concat('first_name', V(' '), 'last_name')).filter(full_name__icontains=value)

    def order_filter(self, queryset, name, value):
        return queryset.order_by(value)


class ChildFilter(filters.FilterSet):
    name = CharFilter(method='name_filter')
    first_name = CharFilter(field_name='first_name', lookup_expr='icontains')
    last_name = CharFilter(field_name='last_name', lookup_expr='icontains')
    order_by = CharFilter(method='order_filter')

    class Meta:
        model = Child
        fields = [
            'name',
            'first_name',
            'last_name',
            'order_by',
        ]

    def name_filter(self, queryset, name, value):
        return queryset.annotate(full_name=Concat('first_name', V(' '), 'last_name')).filter(full_name__icontains=value)

    def order_filter(self, queryset, name, value):
        return queryset.order_by(value)


class CheckFilter(filters.FilterSet):
    child = CharFilter(method='child_filter')
    out_time = CharFilter(method='present_filter')
    order_by = CharFilter(method='order_filter')

    class Meta:
        model = Check
        fields = [
            'date',
            'child',
            'out_time',
            'order_by',
        ]

    def child_filter(self, queryset, name, value):
        return queryset.annotate(full_name=Concat('child__first_name', V(' '), 'child__last_name')).filter(full_name__icontains=value)

    def present_filter(self, queryset, name, value):
        if value == 'true':
            return queryset.filter(out_time__isnull=True)
        else:
            return queryset.filter(out_time__isnull=False)

    def order_filter(self, queryset, name, value):
        return queryset.order_by(value)
