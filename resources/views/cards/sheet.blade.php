@php
    /** @var \App\Models\Tenant\CardTemplate $template */
    $w  = $template->width_mm;
    $h  = $template->height_mm;
    $els = $template->elements ?? [];
    $fontData = $fontData ?? null;
@endphp
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        @if ($fontData)
        @font-face {
            font-family: 'Noto Sans Khmer';
            font-style: normal;
            font-weight: 400 700;
            src: url('{{ $fontData }}') format('truetype');
        }
        @endif

        * { margin: 0; padding: 0; box-sizing: border-box; }

        @page { margin: 8mm; }

        body {
            font-family: 'Noto Sans Khmer', 'DejaVu Sans', sans-serif;
            color: #111827;
        }

        .card {
            position: relative;
            display: inline-block;
            width: {{ $w }}mm;
            height: {{ $h }}mm;
            margin: 0 3mm 3mm 0;
            background: {{ $template->background_color ?? '#ffffff' }};
            border: 0.2mm solid #d1d5db;
            border-radius: 2mm;
            overflow: hidden;
            vertical-align: top;
            page-break-inside: avoid;
        }

        .el { position: absolute; overflow: hidden; }
        .el-text { line-height: 1.05; }
        .el-img  { width: 100%; height: 100%; }
        .el-initials {
            border-radius: 50%;
            color: #ffffff;
            text-align: center;
            font-weight: bold;
        }
    </style>
</head>
<body>
@foreach ($cards as $data)
    <div class="card">
        @foreach ($els as $el)
            @php
                $type = $el['type'] ?? 'text';
                $style = sprintf(
                    'left:%smm; top:%smm; width:%smm; height:%smm;',
                    $el['x'] ?? 0, $el['y'] ?? 0, $el['w'] ?? 10, $el['h'] ?? 6
                );
                $align  = $el['align'] ?? 'left';
                $color  = $el['color'] ?? '#111827';
                $weight = $el['fontWeight'] ?? 'normal';
                $size   = $el['fontSize'] ?? 9;
                $bg     = $el['backgroundColor'] ?? 'transparent';
                $radius = $el['borderRadius'] ?? 0;
            @endphp

            @switch($type)
                @case('rect')
                    <div class="el" style="{{ $style }} background:{{ $bg }}; border-radius:{{ $radius }}mm;"></div>
                    @break

                @case('logo')
                    @if ($logo)
                        <div class="el" style="{{ $style }}">
                            <img src="{{ $logo }}" class="el-img" style="object-fit:contain;">
                        </div>
                    @endif
                    @break

                @case('barcode')
                    @if (!empty($data['barcode']))
                        <div class="el" style="{{ $style }}">
                            <img src="{{ $data['barcode'] }}" class="el-img" style="object-fit:fill;">
                        </div>
                    @endif
                    @break

                @case('initials')
                    <div class="el el-initials"
                         style="{{ $style }} background:{{ $data['avatar_color'] ?? '#1e3a8a' }}; line-height:{{ $el['h'] ?? 18 }}mm; font-size:{{ ($el['h'] ?? 18) * 1.6 }}mm;">
                        {{ $data['initials'] ?? '?' }}
                    </div>
                    @break

                @case('text')
                    <div class="el el-text"
                         style="{{ $style }} text-align:{{ $align }}; color:{{ $color }}; font-weight:{{ $weight }}; font-size:{{ $size }}pt; background:{{ $bg }};">
                        {{ $el['text'] ?? '' }}
                    </div>
                    @break

                @default {{-- field --}}
                    <div class="el el-text"
                         style="{{ $style }} text-align:{{ $align }}; color:{{ $color }}; font-weight:{{ $weight }}; font-size:{{ $size }}pt; background:{{ $bg }};">
                        {{ $data[$el['field'] ?? ''] ?? '' }}
                    </div>
            @endswitch
        @endforeach
    </div>
@endforeach
</body>
</html>
