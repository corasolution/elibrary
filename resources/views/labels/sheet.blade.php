@php
    /** @var \App\Models\Tenant\LabelTemplate $template */
    $cols   = max(1, (int) $template->columns);
    $rows   = max(1, (int) $template->rows);
    $lw     = $template->label_width_mm;
    $lh     = $template->label_height_mm;
    $gx     = $template->gap_x_mm;
    $gy     = $template->gap_y_mm;
    $mt     = $template->margin_top_mm;
    $ml     = $template->margin_left_mm;
    $els    = $template->elements ?? [];
    $pageSize = $template->page_size === 'Letter' ? 'letter' : 'A4';
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
        @page { size: {{ $pageSize }}; margin: 0; }

        body { font-family: 'Noto Sans Khmer', 'Inter', sans-serif; color: #111827; }

        .sheet {
            position: relative;
            width: 100%;
            height: 100vh;
            page-break-after: always;
            overflow: hidden;
        }
        .sheet:last-child { page-break-after: auto; }

        .label { position: absolute; overflow: hidden; }
        .el { position: absolute; overflow: hidden; }
        .el-text { line-height: 1.05; display: flex; align-items: center; }
        .el-img  { width: 100%; height: 100%; }
    </style>
</head>
<body>
@foreach ($pages as $cells)
    <div class="sheet" style="background: {{ $template->background_color ?? '#ffffff' }};">
        @foreach ($cells as $i => $data)
            @php
                $col = $i % $cols;
                $row = intdiv($i, $cols);
                $left = $ml + $col * ($lw + $gx);
                $top  = $mt + $row * ($lh + $gy);
            @endphp
            @if ($data) {{-- null cells = skipped (start offset) --}}
                <div class="label" style="left:{{ $left }}mm; top:{{ $top }}mm; width:{{ $lw }}mm; height:{{ $lh }}mm;">
                    @foreach ($els as $el)
                        @php
                            $type = $el['type'] ?? 'text';
                            $style = sprintf('left:%smm; top:%smm; width:%smm; height:%smm;',
                                $el['x'] ?? 0, $el['y'] ?? 0, $el['w'] ?? 10, $el['h'] ?? 6);
                            $align  = $el['align'] ?? 'left';
                            $justify = $align === 'right' ? 'flex-end' : ($align === 'center' ? 'center' : 'flex-start');
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

                            @case('text')
                                <div class="el el-text" style="{{ $style }} justify-content:{{ $justify }}; text-align:{{ $align }}; color:{{ $color }}; font-weight:{{ $weight }}; font-size:{{ $size }}pt; background:{{ $bg }};">
                                    {{ $el['text'] ?? '' }}
                                </div>
                                @break

                            @default {{-- field --}}
                                <div class="el el-text" style="{{ $style }} justify-content:{{ $justify }}; text-align:{{ $align }}; color:{{ $color }}; font-weight:{{ $weight }}; font-size:{{ $size }}pt; background:{{ $bg }};">
                                    {{ $data[$el['field'] ?? ''] ?? '' }}
                                </div>
                        @endswitch
                    @endforeach
                </div>
            @endif
        @endforeach
    </div>
@endforeach
</body>
</html>
