export interface Template {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: 'ecommerce' | 'service' | 'digital' | 'links';
}

export const templates: Template[] = [
    {
        id: 'multi-purpose',
        name: 'Multi Purpose',
        description: 'Ideal for selling electronics, apparels, and more',
        icon: '🛍️',
        category: 'ecommerce'
    },
    {
        id: 'quick-order',
        name: 'Quick Order',
        description: 'Sell faster with one page layout and instant checkout',
        icon: '⚡',
        category: 'ecommerce'
    },
    {
        id: 'wholesale',
        name: 'Wholesale',
        description: 'Sell in bulk to resellers and other businesses',
        icon: '📦',
        category: 'ecommerce'
    },
    {
        id: 'digital-download',
        name: 'Digital Download',
        description: 'Share downloadable files like e-books, designs, etc.',
        icon: '💾',
        category: 'digital'
    },
    {
        id: 'service-booking',
        name: 'Service Booking',
        description: 'Book services like plumbing, electrical, cleaning, etc.',
        icon: '🔧',
        category: 'service'
    },
    {
        id: 'list-of-links',
        name: 'List of links',
        description: 'Create a list of items online with detailed information',
        icon: '🔗',
        category: 'links'
    }
];
