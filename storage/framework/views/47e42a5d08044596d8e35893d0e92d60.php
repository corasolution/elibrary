<?php
    /** @var \App\Models\Tenant\CardTemplate $template */
    $w  = $template->width_mm;
    $h  = $template->height_mm;
    $els = $template->elements ?? [];
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

        @page { margin: 8mm; }

        body {
            font-family: 'Noto Sans Khmer', 'DejaVu Sans', sans-serif;
            color: #111827;
        }

        .card {
            position: relative;
            display: inline-block;
            width: <?php echo e($w); ?>mm;
            height: <?php echo e($h); ?>mm;
            margin: 0 3mm 3mm 0;
            background: <?php echo e($template->background_color ?? '#ffffff'); ?>;
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
<?php $__currentLoopData = $cards; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $data): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
    <div class="card">
        <?php $__currentLoopData = $els; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $el): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <?php
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

                <?php case ('initials'): ?>
                    <div class="el el-initials"
                         style="<?php echo e($style); ?> background:<?php echo e($data['avatar_color'] ?? '#1e3a8a'); ?>; line-height:<?php echo e($el['h'] ?? 18); ?>mm; font-size:<?php echo e(($el['h'] ?? 18) * 1.6); ?>mm;">
                        <?php echo e($data['initials'] ?? '?'); ?>

                    </div>
                    <?php break; ?>

                <?php case ('text'): ?>
                    <div class="el el-text"
                         style="<?php echo e($style); ?> text-align:<?php echo e($align); ?>; color:<?php echo e($color); ?>; font-weight:<?php echo e($weight); ?>; font-size:<?php echo e($size); ?>pt; background:<?php echo e($bg); ?>;">
                        <?php echo e($el['text'] ?? ''); ?>

                    </div>
                    <?php break; ?>

                <?php default: ?> 
                    <div class="el el-text"
                         style="<?php echo e($style); ?> text-align:<?php echo e($align); ?>; color:<?php echo e($color); ?>; font-weight:<?php echo e($weight); ?>; font-size:<?php echo e($size); ?>pt; background:<?php echo e($bg); ?>;">
                        <?php echo e($data[$el['field'] ?? ''] ?? ''); ?>

                    </div>
            <?php endswitch; ?>
        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
    </div>
<?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
</body>
</html>
<?php /**PATH D:\My project\alpha eLibrary\resources\views/cards/sheet.blade.php ENDPATH**/ ?>