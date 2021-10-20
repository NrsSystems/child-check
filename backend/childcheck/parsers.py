from django.http import QueryDict
from rest_framework import parsers


class MultipartJsonParser(parsers.MultiPartParser):
    def parse(self, stream, media_type=None, parser_context=None):
        result = super().parse(
            stream,
            media_type=media_type,
            parser_context=parser_context
        )
        qdict = QueryDict('', mutable=True)
        for key in result.data:
            if result.data[key] == 'null':
                qdict[key] = None
            elif key == 'guardians':
                if result.data[key] == '':
                    qdict.setlist(key, [])
                else:
                    qdict.setlist(key, result.data[key].split(","))
            else:
                qdict[key] = result.data[key]
        return parsers.DataAndFiles(qdict, result.files)
