<?php
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
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        <?php if($fontData): ?>
        @font-face {
            font-family: 'Noto Sans Khmer';
            font-style: normal;
            font-weight: 400 700;
            src: url('<?php echo e($fontData); ?>') format('truetype');
        }
        <?php endif; ?>

        * { margin: 0; padding: 0; box-sizing: border-box; }
        @page { size: <?php echo e($pageSize); ?>; margin: 0; }

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
<?php $__currentLoopData = $pages; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $cells): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
    <div class="sheet" style="background: <?php echo e($template->background_color ?? '#ffffff'); ?>;">
        <?php $__currentLoopData = $cells; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $i => $data): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <?php
                $col = $i % $cols;
                $row = intdiv($i, $cols);
                $left = $ml + $col * ($lw + $gx);
                $top  = $mt + $row * ($lh + $gy);
            ?>
            <?php if($data): ?> 
                <div class="label" style="left:<?php echo e($left); ?>mm; top:<?php echo e($top); ?>mm; width:<?php echo e($lw); ?>mm; height:<?php echo e($lh); ?>mm;">
                    <?php $__currentLoopData = $els; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $el): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <?php
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
                        ?>

                        <?php switch($type):
                            case ('rect'): ?>
                                <div class="el" style="<?php echo e($style); ?> background:<?php echo e($bg); ?>; border-radius:<?php echo e($radius); ?>mm;"></div>
                                <?php break; ?>

                            <?php case ('logo'): ?>
                                <?php if($logo): ?>
                                    <div class="el" style="<?php echo e($style); ?>">
                                        <img src="<?php echo e($logo); ?>" class="el-img" style="object-fit:contain;">
                                    </div>
                                <?php endif; ?>
                                <?php break; ?>

                            <?php case ('barcode'): ?>
                                <?php if(!empty($data['barcode'])): ?>
                                    <div class="el" style="<?php echo e($style); ?>">
                                        <img src="<?php echo e($data['barcode']); ?>" class="el-img" style="object-fit:fill;">
                                    </div>
                                <?php endif; ?>
                                <?php break; ?>

                            <?php case ('text'): ?>
                                <div class="el el-text" style="<?php echo e($style); ?> justify-content:<?php echo e($justify); ?>; text-align:<?php echo e($align); ?>; color:<?php echo e($color); ?>; font-weight:<?php echo e($weight); ?>; font-size:<?php echo e($size); ?>pt; background:<?php echo e($bg); ?>;">
                                    <?php echo e($el['text'] ?? ''); ?>

                                </div>
                                <?php break; ?>

                            <?php default: ?> 
                                <div class="el el-text" style="<?php echo e($style); ?> justify-content:<?php echo e($justify); ?>; text-align:<?php echo e($align); ?>; color:<?php echo e($color); ?>; font-weight:<?php echo e($weight); ?>; font-size:<?php echo e($size); ?>pt; background:<?php echo e($bg); ?>;">
                                    <?php echo e($data[$el['field'] ?? ''] ?? ''); ?>

                                </div>
                        <?php endswitch; ?>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                </div>
            <?php endif; ?>
        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
    </div>
<?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
</body>
</html>
<?php /**PATH D:\My project\alpha eLibrary\resources\views/labels/sheet.blade.php ENDPATH**/ ?>