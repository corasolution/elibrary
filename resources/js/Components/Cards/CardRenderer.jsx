import Barcode from 'react-barcode';

// CSS reference: 96dpi → 1mm = 3.7795px. One constant, shared with the PDF
// (the Blade renders the same element JSON in native mm) so screen ≈ print.
export const PX_PER_MM = 3.7795;

/**
 * Pure renderer for a single patron card. Drives the editor preview, the
 * workspace preview, and the browser-print view from the same template JSON.
 *
 * @param {object}  template  { width_mm, height_mm, background_color, elements[] }
 * @param {object}  data      resolved field bag (patron_number, full_name, …,
 *                            initials, avatar_color)
 * @param {object}  branding  { logo_url }
 * @param {number}  scale     px multiplier (default 1)
 * @param {string}  selectedId  optional — element id to outline (editor)
 * @param {func}    onSelect    optional — (id) => void (editor)
 */
export default function CardRenderer({
    template,
    data = {},
    branding = {},
    scale = 1,
    selectedId = null,
    onSelect = null,
    renderElement = null,
}) {
    const k = PX_PER_MM * scale;
    const w = (template?.width_mm ?? 85.6) * k;
    const h = (template?.height_mm ?? 54) * k;
    const elements = template?.elements ?? [];

    return (
        <div
            style={{
                position: 'relative',
                width: w,
                height: h,
                backgroundColor: template?.background_color ?? '#ffffff',
                backgroundImage: template?.background_image_url ? `url(${template.background_image_url})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                borderRadius: 2 * k,
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                fontFamily: "'Noto Sans Khmer','Inter',sans-serif",
            }}
        >
            {elements.map((el) => {
                const box = {
                    position: 'absolute',
                    left: (el.x ?? 0) * k,
                    top: (el.y ?? 0) * k,
                    width: (el.w ?? 10) * k,
                    height: (el.h ?? 6) * k,
                    overflow: 'hidden',
                };

                const content = (
                    <ElementBody el={el} data={data} branding={branding} k={k} />
                );

                // Editor wraps each element (drag/resize); workspace renders plain.
                if (renderElement) {
                    return renderElement(el, box, content);
                }

                return (
                    <div
                        key={el.id}
                        style={box}
                        onClick={onSelect ? () => onSelect(el.id) : undefined}
                    >
                        {content}
                    </div>
                );
            })}
        </div>
    );
}

export function ElementBody({ el, data, branding, k }) {
    const type = el.type ?? 'text';

    if (type === 'rect') {
        return (
            <div style={{
                width: '100%', height: '100%',
                background: el.backgroundColor ?? '#e5e7eb',
                borderRadius: (el.borderRadius ?? 0) * k,
            }} />
        );
    }

    if (type === 'logo') {
        return branding?.logo_url
            ? <img src={branding.logo_url} alt="logo"
                   style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            : <div style={{
                width: '100%', height: '100%',
                background: '#ffffff33', borderRadius: 2,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 8, color: '#fff',
              }}>LOGO</div>;
    }

    if (type === 'initials') {
        // If photo exists, render circular photo
        if (data?.photo_url) {
            return (
                <img
                    src={data.photo_url}
                    alt="Patron photo"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '50%'
                    }}
                />
            );
        }

        // Otherwise, render initials circle (fallback)
        return (
            <div style={{
                width: '100%', height: '100%', borderRadius: '50%',
                background: data?.avatar_color ?? '#1e3a8a',
                color: '#fff', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: (el.h ?? 18) * k * 0.42,
            }}>
                {data?.initials ?? '?'}
            </div>
        );
    }

    if (type === 'barcode') {
        const value = String(data?.[el.field] ?? data?.barcode_value ?? data?.patron_number ?? '0000');
        return (
            <div style={{ width: '100%', height: '100%', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
                <Barcode
                    value={value}
                    format="CODE128"
                    width={1.4}
                    height={(el.h ?? 11) * k * 0.7}
                    displayValue={false}
                    margin={0}
                />
            </div>
        );
    }

    // text | field
    const text = type === 'text' ? (el.text ?? '') : (data?.[el.field] ?? '');
    return (
        <div style={{
            width: '100%', height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: el.align === 'right' ? 'flex-end'
                : el.align === 'center' ? 'center' : 'flex-start',
            textAlign: el.align ?? 'left',
            color: el.color ?? '#111827',
            fontWeight: el.fontWeight ?? 'normal',
            fontSize: (el.fontSize ?? 9) * (96 / 72) * scaleFromK(k),
            background: el.backgroundColor && el.backgroundColor !== 'transparent'
                ? el.backgroundColor : undefined,
            lineHeight: 1.05,
            whiteSpace: 'nowrap',
        }}>
            {text}
        </div>
    );
}

// fontSize in the template is in pt; convert pt→px (×96/72) then apply the
// same scale the box uses (k already folds PX_PER_MM × scale).
function scaleFromK(k) {
    return k / PX_PER_MM;
}
