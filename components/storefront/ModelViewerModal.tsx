'use client';

import { useEffect, useRef } from 'react';
import { X, ShoppingCart, Box } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    price: string;
    description?: string | null;
    glbUrl?: string | null;
    images: Array<{ imageUrl: string; isPrimary: boolean }>;
}

interface ModelViewerModalProps {
    product: Product;
    store: { currency: string; slug: string };
    cartQuantity: number;
    onClose: () => void;
    onAddToCart: (productId: string) => void;
}

export default function ModelViewerModal({
    product,
    store,
    cartQuantity,
    onClose,
    onAddToCart,
}: ModelViewerModalProps) {
    const modelViewerRef = useRef<HTMLElement & { activateAR?: () => void }>(null);

    // Load model-viewer v4.1.0 from Google CDN (once per page session)
    useEffect(() => {
        if (document.getElementById('model-viewer-script')) return;
        const script = document.createElement('script');
        script.id = 'model-viewer-script';
        script.type = 'module';
        script.src =
            'https://ajax.googleapis.com/ajax/libs/model-viewer/4.1.0/model-viewer.min.js';
        document.head.appendChild(script);
    }, []);

    // Close on Escape key
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    // Prevent body scroll while modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    const handleViewInRoom = () => {
        if (modelViewerRef.current && typeof modelViewerRef.current.activateAR === 'function') {
            modelViewerRef.current.activateAR();
        } else {
            alert(
                'AR is not supported on this device/browser.\nTry Chrome on Android or Safari on iOS.'
            );
        }
    };

    const currencySymbol =
        store.currency === 'USD'
            ? '$'
            : store.currency === 'INR'
                ? '₹'
                : store.currency === 'EUR'
                    ? '€'
                    : store.currency === 'GBP'
                        ? '£'
                        : '';

    const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];

    /* eslint-disable @next/next/no-img-element */
    return (
        <div
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="bg-white w-full md:max-w-2xl md:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl max-h-[96vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <Box size={20} className="text-indigo-600" />
                        <span className="font-semibold text-gray-800 text-lg">{product.name}</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* 3D Viewer Area */}
                <div className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex-1 min-h-[320px] md:min-h-[420px]">
                    {product.glbUrl ? (
                        <ModelViewerElement
                            ref={modelViewerRef}
                            src={product.glbUrl}
                            alt={product.name}
                        />
                    ) : primaryImage ? (
                        <img
                            src={primaryImage.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover opacity-80"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-white/40 text-sm">
                            No preview available
                        </div>
                    )}

                    {/* 3D badge */}
                    {product.glbUrl && (
                        <div className="absolute top-3 left-3 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 z-10">
                            <Box size={11} /> 3D · AR
                        </div>
                    )}

                    {/* Drag hint */}
                    {product.glbUrl && (
                        <p className="absolute top-3 right-3 text-white/60 text-xs bg-black/30 rounded px-2 py-1 z-10">
                            Drag to rotate
                        </p>
                    )}

                    {/* "View in Room" fallback button (for desktop / Ctrl+F) */}
                    {product.glbUrl && (
                        <button
                            onClick={handleViewInRoom}
                            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-white/10 backdrop-blur border border-white/30 text-white rounded-full px-5 py-2.5 text-sm font-semibold flex items-center gap-2 hover:bg-white/20 transition-colors whitespace-nowrap"
                        >
                            🪄 View in Room (AR)
                        </button>
                    )}
                </div>

                {/* Product Info + Add to Cart */}
                <div className="px-6 py-5 space-y-3">
                    {product.description && (
                        <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
                    )}
                    <div className="flex items-center justify-between gap-4">
                        <p className="text-2xl font-bold text-gray-900">
                            {currencySymbol}
                            {parseFloat(product.price).toFixed(2)}
                        </p>
                        <button
                            onClick={() => {
                                onAddToCart(product.id);
                                onClose();
                            }}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow"
                        >
                            <ShoppingCart size={18} />
                            Add to Cart {cartQuantity > 0 && `(${cartQuantity})`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Wrapper that renders the <model-viewer> custom element.
 * Isolated in its own component so we can use React.forwardRef cleanly.
 */
import { forwardRef } from 'react';

const ModelViewerElement = forwardRef<
    HTMLElement & { activateAR?: () => void },
    { src: string; alt: string }
>(function ModelViewerElement({ src, alt }, ref) {
    // We render through dangerouslySetInnerHTML to avoid TS errors with custom elements.
    // The ref is attached via a callback on a wrapper div since model-viewer manages its own DOM.
    return (
        <div
            ref={(el) => {
                if (!el) return;
                const mv = el.querySelector('model-viewer') as (HTMLElement & { activateAR?: () => void }) | null;
                if (ref && typeof ref === 'object') {
                    (ref as React.MutableRefObject<typeof mv>).current = mv;
                }
            }}
            style={{ position: 'absolute', inset: 0 }}
            dangerouslySetInnerHTML={{
                __html: `<model-viewer
                    src="${src}"
                    alt="${alt}"
                    ar
                    ar-modes="webxr scene-viewer quick-look"
                    ar-scale="auto"
                    camera-controls
                    auto-rotate
                    rotation-per-second="30deg"
                    shadow-intensity="1"
                    exposure="0.8"
                    environment-image="neutral"
                    touch-action="pan-y"
                    style="width:100%;height:100%;background:transparent;"
                >
                    <button slot="ar-button" style="
                        position:absolute;
                        bottom:16px;
                        right:16px;
                        background:white;
                        color:#4338ca;
                        border:none;
                        border-radius:9999px;
                        padding:8px 16px;
                        font-size:14px;
                        font-weight:600;
                        cursor:pointer;
                        display:flex;
                        align-items:center;
                        gap:6px;
                        box-shadow:0 4px 12px rgba(0,0,0,0.2);
                    ">🪄 View in Room</button>
                </model-viewer>`,
            }}
        />
    );
});
